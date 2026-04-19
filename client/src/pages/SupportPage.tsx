function SupportPage() {
    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                        Help & Support
                    </p>

                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        Support Center
                    </h1>

                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        Get help with account access, training setup, subscriptions, and platform issues.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">Common Support Topics</h2>
                        <ul className="mt-4 space-y-3 text-slate-300">
                            <li>• Login and account access issues</li>
                            <li>• Employer training setup help</li>
                            <li>• Employee access and assignment problems</li>
                            <li>• Subscription and billing support</li>
                            <li>• Quiz, folder, and training item troubleshooting</li>
                        </ul>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">How to Reach Support</h2>
                        <p className="mt-4 text-slate-300">
                            Email: supforstaffbuilder@staffbuilder.com
                        </p>
                        <p className="mt-4 text-slate-300">
                            Contact: +1(437)838-1376
                        </p>
                        <p className="mt-2 text-slate-300">
                            Response Time: Within 1–2 business days
                        </p>
                        <p className="mt-4 text-sm leading-6 text-slate-400">
                            For urgent access issues, please include your account email, business name,
                            and a clear description of the problem.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default SupportPage;