# Fix Login Navigation Issue

The application fails to navigate to the dashboard after login because of a race condition between the state update (`isLoggedIn`) and the imperative navigation (`navigate('/cashflow')`).

When `login` is called:
1.  `setToken` is scheduled (async).
2.  `navigate('/cashflow')` executes immediately.
3.  React Router tries to match `/cashflow`.
4.  Since `isLoggedIn` is still `false` (state hasn't propagated), `AppRoutes` renders the "public" routes.
5.  `/cashflow` is not in public routes, so it hits the catch-all `*` and redirects back to `/login`.

## User Review Required
> [!NOTE]
> I will remove the `navigate` call from `AuthContext.tsx`. Navigation will be handled automatically by `App.tsx` routing logic: once `isLoggedIn` becomes true, the "public" routes (including `/login`) are unmounted, and the catch-all route will redirect the user to `/`.

## Proposed Changes

### Frontend

#### [MODIFY] [AuthContext.tsx](file:///wsl.localhost/Ubuntu/home/james/Original_Tracker_app/Transaction-Tracker/frontend/src/context/AuthContext.tsx)
- Remove `useNavigate` hook usage.
- Remove `navigate('/cashflow')` from `login` function.
- Remove `navigate('/')` from `logout` function (optional, but consistent).

#### [MODIFY] [App.tsx](file:///wsl.localhost/Ubuntu/home/james/Original_Tracker_app/Transaction-Tracker/frontend/src/App.tsx)
- Ensure the catch-all route redirects to `/cashflow` or `/` (which renders `CashFlow`). Currently it redirects to `/`, which is correct.

## Verification Plan

### Automated Tests
- I will run the application and simulate the login flow (if possible with a mock).
- Since I cannot easily run the full backend, I will verify the code changes by inspection and ensuring the logic holds.

### Manual Verification
- The user should try to login again.
- Expected behavior:
    1.  Click Login.
    2.  State updates.
    3.  App re-renders.
    4.  Router redirects from `/login` to `/` (Dashboard).
