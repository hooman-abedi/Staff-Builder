function TermsPage() {
    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <p className="mb-4 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-sm font-medium text-amber-300">
                        Legal
                    </p>

                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        Terms of Service
                    </h1>

                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        These terms govern access to and use of the Staff Builder platform.
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">1. Use of the Platform</h2>
                        <p className="mt-4 leading-8 text-slate-300">
                            Staff Builder provides tools for businesses to manage employee training,
                            content delivery, progress tracking, and administrative workflows.
                            Users agree to use the platform only for lawful business and training purposes.
                        </p>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">2. Accounts and Responsibilities</h2>
                        <p className="mt-4 leading-8 text-slate-300">
                            Users are responsible for maintaining the confidentiality of their login
                            credentials and for all activities performed through their accounts.
                            Employers are responsible for managing their assigned employees and training content.
                        </p>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">3. Subscriptions and Access</h2>
                        <p className="mt-4 leading-8 text-slate-300">
                            Certain platform features may depend on subscription plan and business status.
                            Access may be restricted when subscriptions expire, are suspended,
                            or become inactive.
                        </p>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">4. Platform Availability</h2>
                        <p className="mt-4 leading-8 text-slate-300">
                            While reasonable efforts are made to maintain system availability,
                            Staff Builder does not guarantee uninterrupted service and may perform
                            updates, maintenance, or security changes when required.
                        </p>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">5. Termination</h2>
                        <p className="mt-4 leading-8 text-slate-300">
                            Accounts may be suspended or terminated for misuse, unauthorized access,
                            violation of platform rules, or administrative enforcement actions.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default TermsPage;