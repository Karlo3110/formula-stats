import { forwardRef, type InputHTMLAttributes, useId } from 'react';

import { Input } from './Input';
import { Label } from './Label';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ label, error, id, ...rest }, ref) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const errorId = `${fieldId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId}>{label}</Label>
        <Input
          ref={ref}
          id={fieldId}
          hasError={Boolean(error)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {error ? (
          <p id={errorId} className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
