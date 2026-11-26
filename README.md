# Task Board (Section 2)

In this section you'll build a small Kanban board in **plain React and CSS**, without any AI tools.

This repo gives you a working Next.js setup, the TypeScript types and a mock API. Everything else is up to you.

---

## 1. Getting started

**You need:** Node.js **24** (the exact version is in `.nvmrc`) and npm.

If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use` in this folder to switch to the right version.

```bash
npm install
npm run dev
```

Then open http://localhost:3000. You should see a "Task Board" heading and a short message.

Other useful commands:

| Command | What it does |
|---|---|
| `npm run dev` | Starts the app in development mode |
| `npm run build` | Builds the app for production (also checks types) |
| `npm run lint` | Runs ESLint |
| `npm test` | Runs the tests for the mock API |
| `npm run check-deps` | Checks you haven't added any packages that aren't allowed |

---

## 2. What's provided

```
src/
├── app/
│   ├── layout.tsx     # root layout
│   ├── page.tsx       # placeholder page: start here
│   └── globals.css    # a small CSS reset
├── types.ts           # Task, TaskStatus and CreateTaskInput types
└── api/
    ├── tasks.ts       # the mock API (do not edit)
    ├── seed.ts        # the 12 tasks the board starts with
    └── tasks.test.ts  # tests for the mock API
```

### Types (`src/types.ts`)

```ts
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;   // e.g. "2026-12-31"
  createdAt: string;  // e.g. "2026-11-20T09:30:00.000Z"
}
```

### The mock API (`src/api/tasks.ts`)

The mock API pretends to be a real server. All functions return Promises.

| Function | What it does |
|---|---|
| `getTasks()` | Returns all tasks. Never fails. |
| `createTask(input)` | Creates a task and returns it. Rejects if the input is invalid (see below). Never fails randomly. |
| `updateTaskStatus(id, status)` | Moves a task to another column and returns the updated task. **Fails randomly about 20% of the time.** |

Things to know:

- **It's slow on purpose.** Every call takes between 300 and 800 ms.
- **Moving a task can fail.** `updateTaskStatus` sometimes rejects with the message `"Network error: could not move task"`. Your UI needs to handle this.
- **Errors are `ApiError`s.** Each one has a `message` and a `status`:
  - `400`: the input was invalid
  - `404`: no task with that id
  - `503`: random network error
- **`createTask` validation.** It rejects with status `400` if:
  - the title is empty (spaces don't count)
  - the title is longer than 80 characters
  - the status isn't `TODO`, `IN_PROGRESS` or `DONE`
  - the due date isn't a real date in `YYYY-MM-DD` format

  If you don't pass a status, the new task goes into `TODO`.
- **You always get copies.** Changing a task object you got from the API doesn't change the API's data. Only the API functions do.
- **Data resets on reload.** It's all kept in memory.
- **Browser only.** The data lives in the browser, so you must call these functions from a **Client Component** (a file that starts with `'use client'`). If you call them on the server, you'll get an error telling you so.
- **Do not modify `src/api/tasks.ts`.** Treat it like an external API owned by another team. (Ignore the functions starting with `__`. They exist only for the tests.)

---

## 3. The task

Replace the placeholder page with a Kanban board that meets these requirements:

- **Three columns** (TODO / IN_PROGRESS / DONE) using a responsive layout that stacks into one column on screens under 768 px.
- **Move a task between columns** using buttons. Drag-and-drop is optional.
- **A search box** that filters tasks by title, with a **debounce of 300 ms** that you implement yourself.
- **Optimistic moves:** the card moves immediately; if the API call fails, it moves back and an error message is shown.
- **An inline "Add task" form:** title required, max 80 characters, error shown under the field.
- **Each column header shows the number of tasks** in that column, and it must always be correct.
- **Basic accessibility:** real `<button>` elements, labelled inputs, visible focus styles.
- **A loading state** while tasks are first fetched.

How you structure your components, state and CSS is up to you. We're more interested in clear, working code than in fancy design.

---

## 4. Rules

- **No AI tools of any kind.** This includes Copilot, Cursor autocomplete and chat assistants. Please switch off any AI features in your editor before you start.
- **Docs and web search are fine.** Use official docs ([MDN](https://developer.mozilla.org), [react.dev](https://react.dev), [nextjs.org/docs](https://nextjs.org/docs)) and normal web search as much as you like.
- **No new dependencies.** No UI libraries, no utility libraries (like lodash) and no drag-and-drop libraries. `npm run check-deps` must pass.
- **Plain CSS or CSS Modules only.** No Tailwind, no CSS-in-JS.
- **Commit as you work.** Make at least 5 commits, and don't squash them. We'd like to see how you got there.
- **Expected time: 90–120 minutes.** If you run out of time, leave a short note at the end of this README about what you'd do next.

---

## 5. In the interview

You'll be asked to make some changes to this code **live**, without AI, while sharing your screen. Make sure you understand every line you wrote.

---

## 6. Tips

- Add `?failRate=0` to the URL (http://localhost:3000/?failRate=0) to turn off random failures while you build.
- Use `?failRate=1` to make every move fail, so you can test your error handling.
- Any value from `0` to `1` works, e.g. `?failRate=0.5`.
- Read `src/api/tasks.ts` if you want to see exactly how the API behaves.
