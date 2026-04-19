function PrivacyPage() {
    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <p className="mb-4 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-sm font-medium text-violet-300">
                        Legal
                    </p>

                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        Privacy Policy
                    </h1>

                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        This policy explains how Staff Builder collects, uses, and protects user data.
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
                        <p className="mt-4 leading-8 text-slate-300">
                            We collect basic account information such as email, role, and business
                            association. Training activity, completions, and quiz results are also
                            stored to provide platform functionality.
                        </p>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">2. How We Use Information</h2>
                        <p className="mt-4 leading-8 text-slate-300">
                            Data is used to deliver training features, track employee progress,
                            manage subscriptions, and improve system performance and reliability.
                        </p>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">3. Data Sharing</h2>
                        <p className="mt-4 leading-8 text-slate-300">
                            We do not sell user data. Information is only shared within the platform
                            between employers and employees as required for training and administration.
                        </p>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">4. Security</h2>
                        <p className="mt-4 leading-8 text-slate-300">
                            Reasonable security measures are implemented to protect user data,
                            including authentication, role-based access control, and backend validation.
                        </p>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">5. User Rights</h2>
                        <p className="mt-4 leading-8 text-slate-300">
                            Users may request account updates, access corrections, or removal through
                            their employer or platform administrators.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPage;