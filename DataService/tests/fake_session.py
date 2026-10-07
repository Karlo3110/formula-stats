"""A small synthetic race shaped like a loaded FastF1 session.

Used by the builder tests (and to generate local fixture data). Units match
FastF1: positions in 1/10 m, times as pandas Timedeltas from session start.
"""

from dataclasses import dataclass, field

import numpy as np
import pandas as pd

TRACK_POINTS = 4000
SAMPLE_HZ = 4.0
LIGHTS_OUT = 300.0
PIT_LANE_OFFSET_RAW = 300.0
PIT_STOP_SECONDS = 22.0
TEAMS = [("Red Bull Racing", "3671C6"), ("McLaren", "FF8000"), ("Ferrari", "E8002D"), ("Mercedes", "27F4D2")]


def track_polyline() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """An irregular ~4.3 km loop (raw units) with elevation, start at index 0."""
    theta = np.linspace(0, 2 * np.pi, TRACK_POINTS, endpoint=False)
    radius = 6000 + 1500 * np.sin(3 * theta) + 700 * np.cos(5 * theta + 1)
    x, y = radius * np.cos(theta) * 1.3, radius * np.sin(theta) * 0.8
    z = 50 * np.sin(2 * theta)
    seg = np.hypot(np.diff(np.append(x, x[0])), np.diff(np.append(y, y[0])))
    return x, y, np.concatenate([[0.0], np.cumsum(seg)]), z


@dataclass
class FakeSession:
    name: str
    drivers: list[str]
    pos_data: dict[str, pd.DataFrame]
    car_data: dict[str, pd.DataFrame]
    laps: pd.DataFrame
    results: pd.DataFrame
    fastest_lap: pd.DataFrame
    total_laps: int | None
    race_control_messages: pd.DataFrame
    t0_date: None = None
    info: dict[str, dict[str, str]] = field(default_factory=dict)

    def get_driver(self, number: str) -> dict[str, str]:
        return self.info[number]


def _point(distance: np.ndarray, x: np.ndarray, y: np.ndarray, s: np.ndarray, z: np.ndarray) -> tuple[np.ndarray, ...]:
    length = s[-1]
    wrapped = np.mod(distance, length)
    closed = np.append(s[:-1], length)
    return (
        np.interp(wrapped, closed, np.append(x, x[0])[: len(closed)]),
        np.interp(wrapped, closed, np.append(y, y[0])[: len(closed)]),
        np.interp(wrapped, closed, np.append(z, z[0])[: len(closed)]),
    )


def _speed(distance: np.ndarray, length: float, pace: float) -> np.ndarray:
    """m/s varying through 'corners' (four slow points per lap)."""
    return pace * (62.0 + 22.0 * np.cos(4 * 2 * np.pi * distance / length))


def make_race(drivers: int = 6, laps: int = 3, name: str = "Race") -> FakeSession:
    x, y, s, z = track_polyline()
    length = s[-1]
    dt = 1.0 / SAMPLE_HZ
    times = np.arange(0.0, LIGHTS_OUT + laps * 200.0, dt)
    numbers = [str(n) for n in (1, 4, 16, 44, 81, 63, 10, 14)[:drivers]]
    pit_driver, retired_driver = numbers[1], numbers[-1]

    pos_data, car_data, lap_rows, result_rows, info = {}, {}, [], [], {}
    for index, number in enumerate(numbers):
        pace = 1.0 - 0.004 * index
        distance = -(80.0 + 80.0 * index) * 10  # grid slot behind the line (raw)
        lap_start, completed, pit_until = LIGHTS_OUT, 0, None
        xs, ys, zs, speeds, laps_out = [], [], [], [], []
        retired = False
        for t in times:
            speed = 0.0
            if t >= LIGHTS_OUT and not retired and completed < laps:
                if pit_until is not None and t < pit_until:
                    speed = 0.0
                else:
                    pit_until = None
                    speed = float(_speed(np.array([distance / 10]), length / 10, pace)[0])
                    before = distance
                    distance += speed * dt * 10
                    if np.floor(before / length) < np.floor(distance / length):
                        completed += 1
                        row = {"DriverNumber": number, "LapNumber": completed, "LapStartTime": lap_start, "Time": t,
                               "PitInTime": np.nan, "PitOutTime": np.nan}
                        if number == pit_driver and completed == 2:
                            row["PitInTime"] = t - 1.0
                            pit_until = t + PIT_STOP_SECONDS
                        if number == pit_driver and completed == 3:
                            row["PitOutTime"] = lap_start + 1.0
                        laps_out.append(row)
                        lap_start = t if pit_until is None else pit_until
                        if number == retired_driver and completed == 2:
                            retired = True
            px, py, pz = _point(np.array([distance]), x, y, s, z)
            offset = PIT_LANE_OFFSET_RAW if pit_until is not None else 0.0
            xs.append(px[0]), ys.append(py[0] + offset), zs.append(pz[0]), speeds.append(speed * 3.6)
        session_time = pd.to_timedelta(times, unit="s")
        pos_data[number] = pd.DataFrame({"SessionTime": session_time, "X": xs, "Y": ys, "Z": zs, "Status": "OnTrack"})
        car_data[number] = pd.DataFrame({"SessionTime": session_time, "Speed": speeds})
        lap_rows.extend(laps_out)
        team, color = TEAMS[index % len(TEAMS)]
        info[number] = {"Abbreviation": f"D{number:0>2}", "TeamName": team, "TeamColor": color}
        result_rows.append({"DriverNumber": number, "Status": "Accident" if number == retired_driver else "Finished"})

    laps_df = pd.DataFrame(lap_rows)
    for column in ("LapStartTime", "Time", "PitInTime", "PitOutTime"):
        laps_df[column] = pd.to_timedelta(laps_df[column], unit="s")
    laps_df["LapTime"] = laps_df["Time"] - laps_df["LapStartTime"]
    laps_df["Deleted"] = False
    fx, fy, fz = _point(np.linspace(0, length, 300, endpoint=False), x, y, s, z)
    messages = pd.DataFrame({
        "Time": pd.to_timedelta([LIGHTS_OUT - 2, LIGHTS_OUT + 40, LIGHTS_OUT + 70], unit="s"),
        "Category": ["Other", "Flag", "Flag"],
        "Message": ["RACE START", "YELLOW IN TRACK SECTOR 2", "CLEAR IN TRACK SECTOR 2"],
        "Flag": [None, "YELLOW", "CLEAR"],
        "Scope": [None, "Sector", "Sector"],
    })
    return FakeSession(
        name=name,
        drivers=numbers,
        pos_data=pos_data,
        car_data=car_data,
        laps=laps_df,
        results=pd.DataFrame(result_rows).set_index("DriverNumber", drop=False),
        fastest_lap=pd.DataFrame({"X": fx, "Y": fy, "Z": fz}),
        total_laps=laps if name in ("Race", "Sprint") else None,
        race_control_messages=messages,
        info=info,
    )
