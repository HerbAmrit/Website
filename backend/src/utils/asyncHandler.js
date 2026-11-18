// Express 4 does not automatically catch a rejected promise thrown inside an
// async route handler — left unhandled, it crashes the entire Node process
// (not just that one request), taking down every other in-flight request too,
// including completely unrelated ones like login. Wrapping every handler with
// this ensures a database hiccup (or any other async error) always becomes a
// clean error response instead of an outage.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
