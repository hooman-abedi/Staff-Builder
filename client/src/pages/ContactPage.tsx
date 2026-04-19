function ContactPage() {
    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <p className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-300">
                        Contact
                    </p>

                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        Contact Us
                    </h1>

                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        Reach out for platform questions, business inquiries, or product feedback.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">General Contact</h2>
                        <p className="mt-4 text-slate-300">Email: hello@staffbuilder.com</p>
                        <p className="mt-2 text-slate-300">Support: support@staffbuilder.com</p>
                        <p className="mt-2 text-slate-300">Phone: +1 (437) 838-1376</p>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">Business Hours</h2>
                        <p className="mt-4 text-slate-300">Monday – Friday</p>
                        <p className="mt-2 text-slate-300">9:00 AM – 5:00 PM</p>
                        <p className="mt-2 text-slate-300">Eastern Time</p>
                    </section>
                </div>

                <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <h2 className="text-2xl font-semibold text-white">Office Address</h2>
                    <p className="mt-4 text-slate-300">
                        Staff Builder Inc.
                    </p>
                    <p className="mt-2 text-slate-300">
                        100 Toronto Avenue
                    </p>
                    <p className="mt-2 text-slate-300">
                        Toronto, Ontario, Canada
                    </p>
                </section>
            </div>
        </div>
    );
}

export default ContactPage;