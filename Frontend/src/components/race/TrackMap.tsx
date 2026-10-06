'use client';

import { useMemo, type JSX } from 'react';

import { CircuitOutline } from '@/components/f1/CircuitOutline';
import { Panel } from '@/components/ui/Panel';
import { useCarMarkers } from '@/hooks/use-car-markers';
import { projectTrack, type TrackProjection } from '@/lib/race/track-projection';
import { useRaceStore } from '@/stores/use-race-store';

const VIEW_SIZE = 200;
const VIEW_PADDING = 14;
const CAR_RADIUS = 3.2;
const SELECTED_RADIUS = 5;

interface TrackMapProps {
  outline: ReadonlyArray<ReadonlyArray<number>> | null;
}

function CarDots({ projection }: { projection: TrackProjection }): JSX.Element {
  const markers = useCarMarkers();
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const selectDriver = useRaceStore((state) => state.selectDriver);
  // Draw the followed car last so it sits on top of the pack.
  const ordered = [...markers].sort(
    (a, b) => Number(a.id === selectedDriverId) - Number(b.id === selectedDriverId),
  );

  return (
    <g>
      {ordered.map((marker) => {
        const point = projection.project(marker.x, marker.z);
        const isSelected = marker.id === selectedDriverId;
        return (
          <g key={marker.id} transform={`translate(${point.x} ${point.y})`} onClick={() => selectDriver(marker.id)} className="cursor-pointer">
            <circle r={isSelected ? SELECTED_RADIUS : CAR_RADIUS} fill={marker.color} stroke="#0b0b0c" strokeWidth={1} />
            {isSelected ? (
              <text y={-8} textAnchor="middle" className="fill-heading font-mono text-[7px] font-semibold">
                {marker.code}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

/** Top-down circuit map with every car's live position. */
export function TrackMap({ outline }: TrackMapProps): JSX.Element {
  const projection = useMemo(
    () => (outline ? projectTrack(outline, VIEW_SIZE, VIEW_PADDING) : null),
    [outline],
  );

  return (
    <Panel title="Track map" bodyClassName="flex items-center justify-center p-2">
      {projection ? (
        <svg viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`} className="aspect-square h-full max-h-44 w-full max-w-44" role="img" aria-label="Circuit map with live car positions">
          <CircuitOutline projection={projection} />
          <CarDots projection={projection} />
        </svg>
      ) : (
        <div className="aspect-square h-full max-h-44 w-full max-w-44 animate-pulse rounded-full border border-dashed border-white/10" />
      )}
    </Panel>
  );
}
