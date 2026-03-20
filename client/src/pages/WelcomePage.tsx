import { Link } from "react-router-dom";

function WelcomePage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                            Custom staff training for growing businesses
                        </p>

                        <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
                            Build, assign, and track staff training in one place.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                            Staff Builder helps employers organize training by role, create folders,
                            upload videos and documents, assign learning to employees, and monitor
                            completion with a clean workflow.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                to="/register"
                                className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
                            >
                                Start Free Trial
                            </Link>

                            <Link
                                to="/login"
                                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
                            >
                                Login
                            </Link>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400">
                            <div>
                                <span className="font-semibold text-white">Role-based</span> training
                            </div>
                            <div>
                                <span className="font-semibold text-white">File + video</span> support
                            </div>
                            <div>
                                <span className="font-semibold text-white">Progress</span> tracking
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 rounded-3xl bg-sky-500/10 blur-3xl" />
                        <div className="relative rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Staff Builder</h2>
                                    <p className="text-sm text-slate-400">Employer workspace preview</p>
                                </div>
                                <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                                    Live workflow
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="mb-2 text-sm font-medium text-slate-400">Staff Categories</p>
                                    <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sm text-sky-300">
                      Manager
                    </span>
                                        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-sm text-violet-300">
                      Instructor
                    </span>
                                        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm text-amber-300">
                      Front Desk
                    </span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="mb-3 text-sm font-medium text-slate-400">Folders</p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                                            <p className="text-2xl">📁</p>
                                            <p className="mt-2 font-semibold text-white">Leadership</p>
                                            <p className="text-sm text-slate-400">Policies, standards, manager guides</p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                                            <p className="text-2xl">📁</p>
                                            <p className="mt-2 font-semibold text-white">Scheduling</p>
                                            <p className="text-sm text-slate-400">Shift planning and daily operations</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="mb-3 text-sm font-medium text-slate-400">Training Progress</p>
                                    <div className="space-y-3">
                                        <div className="rounded-xl bg-slate-900 p-3">
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span className="text-white">Hooman</span>
                                                <span className="text-emerald-300">Completed 8 / 10</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-800">
                                                <div className="h-2 w-4/5 rounded-full bg-emerald-400" />
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-slate-900 p-3">
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span className="text-white">Amir</span>
                                                <span className="text-amber-300">Completed 4 / 10</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-800">
                                                <div className="h-2 w-2/5 rounded-full bg-amber-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-slate-800 bg-slate-950/70">
                <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
                    <div className="mb-12 text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                            Features
                        </p>
                        <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                            Everything you need to organize staff training
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
                            Built for employers who want structured training, clear assignments,
                            and visible progress across their team.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                            <div className="mb-4 text-3xl">🧩</div>
                            <h3 className="text-xl font-semibold text-white">Role-Based Categories</h3>
                            <p className="mt-3 text-slate-400">
                                Organize training by staff type such as Manager, Instructor, or Front Desk.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                            <div className="mb-4 text-3xl">📂</div>
                            <h3 className="text-xl font-semibold text-white">Folders and Structure</h3>
                            <p className="mt-3 text-slate-400">
                                Keep lessons neat with folders for policies, scheduling, safety, and more.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                            <div className="mb-4 text-3xl">🎥</div>
                            <h3 className="text-xl font-semibold text-white">Videos, Files, and Notes</h3>
                            <p className="mt-3 text-slate-400">
                                Upload documents, videos, links, and text-based instructions in one place.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                            <div className="mb-4 text-3xl">📈</div>
                            <h3 className="text-xl font-semibold text-white">Completion Tracking</h3>
                            <p className="mt-3 text-slate-400">
                                Monitor who completed which training items and identify missing progress fast.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-slate-800 bg-slate-950">
                <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
                    <div className="mb-12 text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                            How it works
                        </p>
                        <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                            Simple workflow, powerful structure
                        </h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-lg font-bold text-sky-300">
                                1
                            </div>
                            <h3 className="text-lg font-semibold text-white">Create your business</h3>
                            <p className="mt-2 text-slate-400">
                                Set up your company account and get your training workspace ready.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-lg font-bold text-violet-300">
                                2
                            </div>
                            <h3 className="text-lg font-semibold text-white">Add staff and roles</h3>
                            <p className="mt-2 text-slate-400">
                                Add employees and assign the right training categories to each person.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-lg font-bold text-amber-300">
                                3
                            </div>
                            <h3 className="text-lg font-semibold text-white">Upload training content</h3>
                            <p className="mt-2 text-slate-400">
                                Build folders and add training files, videos, links, and written instructions.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-lg font-bold text-emerald-300">
                                4
                            </div>
                            <h3 className="text-lg font-semibold text-white">Track completion</h3>
                            <p className="mt-2 text-slate-400">
                                Employees complete training and employers monitor progress in real time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-slate-800 bg-slate-950/80">
                <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
                    <div className="mb-12 text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                            Pricing Preview
                        </p>
                        <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                            Plans that can grow with your team
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
                            Start simple, then scale as your business adds more staff and more training.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
                            <h3 className="text-2xl font-bold text-white">Starter</h3>
                            <p className="mt-2 text-slate-400">For small teams getting organized</p>
                            <p className="mt-6 text-4xl font-bold text-white">$19</p>
                            <p className="mt-1 text-slate-400">per month</p>
                            <ul className="mt-6 space-y-3 text-slate-300">
                                <li>Up to 5 employees</li>
                                <li>Core training management</li>
                                <li>Completion tracking</li>
                            </ul>
                        </div>

                        <div className="rounded-3xl border border-sky-500/40 bg-slate-900 p-8 shadow-lg shadow-sky-500/10">
                            <div className="mb-4 inline-block rounded-full bg-sky-500/20 px-3 py-1 text-sm font-medium text-sky-300">
                                Most Popular
                            </div>
                            <h3 className="text-2xl font-bold text-white">Business</h3>
                            <p className="mt-2 text-slate-400">For growing businesses with active teams</p>
                            <p className="mt-6 text-4xl font-bold text-white">$49</p>
                            <p className="mt-1 text-slate-400">per month</p>
                            <ul className="mt-6 space-y-3 text-slate-300">
                                <li>Up to 25 employees</li>
                                <li>Structured categories and folders</li>
                                <li>File and video training support</li>
                            </ul>
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
                            <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                            <p className="mt-2 text-slate-400">For large teams with advanced needs</p>
                            <p className="mt-6 text-4xl font-bold text-white">Custom</p>
                            <p className="mt-1 text-slate-400">annual options available</p>
                            <ul className="mt-6 space-y-3 text-slate-300">
                                <li>Unlimited employees</li>
                                <li>Advanced onboarding workflows</li>
                                <li>Future billing and support upgrades</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-slate-800 bg-slate-950">
                <div className="mx-auto max-w-5xl px-6 py-20 text-center md:px-10">
                    <h2 className="text-3xl font-bold text-white md:text-5xl">
                        Ready to organize your staff training?
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
                        Create structured training for your team, assign the right content,
                        and keep track of progress from one dashboard.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            to="/register"
                            className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
                        >
                            Create Employer Account
                        </Link>

                        <Link
                            to="/login"
                            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
                        >
                            Employee Login
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default WelcomePage;