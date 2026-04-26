import { useState, useEffect, useCallback, useRef } from 'react';

// Fetch data with loading/error states
export function useFetch(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (mounted.current) setData(result);
    } catch (err) {
      if (mounted.current) setError(err.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    execute();
    return () => { mounted.current = false; };
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// Debounce hook
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Form hook with validation
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(v => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
    if (touched[name] && validate) {
      const errs = validate({ ...values, [name]: value });
      setErrors(prev => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    if (validate) {
      const errs = validate(values);
      setErrors(prev => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleSubmit = (onSubmit) => async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    if (validate) {
      const errs = validate(values);
      setErrors(errs);
      if (Object.values(errs).some(Boolean)) return;
    }
    setSubmitting(true);
    try { await onSubmit(values); } finally { setSubmitting(false); }
  };

  const reset = () => { setValues(initialValues); setErrors({}); setTouched({}); };

  return { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit, reset, setValues };
}

// Confirm modal hook
export function useConfirm() {
  const [state, setState] = useState({ open: false, message: '', resolve: null });
  const confirm = (message) => new Promise(resolve => setState({ open: true, message, resolve }));
  const handleClose = (result) => { state.resolve(result); setState({ open: false, message: '', resolve: null }); };
  return { confirmState: state, confirm, handleClose };
}