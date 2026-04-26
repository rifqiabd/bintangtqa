1.  **Update `RegistrationForm.tsx` to include `school` input:**
    *   Add `school` state to `RegistrationFormProps` (`school: string`, `setSchool: (value: string) => void`).
    *   In the form rendering logic, render the `school` input only when `role === "student"`.

2.  **Update `Auth.tsx` to manage `school` state:**
    *   Add `school` state (`const [school, setSchool] = useState("")`).
    *   Pass `school` and `setSchool` into `RegistrationForm`.
    *   Pass `school` to `registerUser` inside the options.

3.  **Update `authQueries.ts` (`registerUser` function):**
    *   Update `options` parameter typing in `registerUser` to accept `school?: string`.
    *   Because `school` isn't in `profiles` schema, I will pass it to `supabase.auth.signUp({ options: { data: { school: options?.school } } })`. Supabase `signUp` allows storing custom user metadata this way.

4.  **Complete pre commit steps**
    *   Execute `npm run build` and type checking.
    *   Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

5.  **Submit the change**
    *   Submit the git changes on the current branch.
