import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';

const MotionDiv = motion.div;

export default function Hero() {
    return (
        <section className="relative overflow-hidden py-16 sm:py-24">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <MotionDiv
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                >
                    {/* Left Content */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
                                Hello, What Do You Want to<br />
                                <span className="text-teal-600">Practice?</span>
                            </h1>

                            <div className="space-y-4 pt-2">
                                <input
                                    type="text"
                                    placeholder="Learn DSA, solve problems..."
                                    className="w-full px-5 py-3 rounded-lg border-2 border-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-600"
                                />

                                <div className="flex flex-wrap gap-2">
                                    {["Arrays & Strings", "Trees & Graphs", "Dynamic Programming"].map((tag) => (
                                        <button
                                            key={tag}
                                            className="px-4 py-2 rounded-full border-2 border-black bg-white text-xs sm:text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Secondary CTA Section */}
                        <div className="pt-4 space-y-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                                    Need Help with <span className="text-teal-600">Learning Paths?</span>
                                </h2>
                                <p className="text-sm sm:text-base text-slate-600">
                                    Get personalized roadmaps, solve curated problems, and share your solutions with the community.
                                </p>
                            </div>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                            >
                                Explore Now
                                <MdArrowForward className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Testimonials */}
                    <div className="hidden lg:block space-y-6">
                        <div className="space-y-4">
                            {[
                                {
                                    name: "Arjun",
                                    quote: "This platform helped me master DSA concepts. The instant code sharing feature accelerated my learning.",
                                    color: "from-orange-400 to-orange-500"
                                },
                                {
                                    name: "Priya",
                                    quote: "Collaborative problem solving changed how I approach algorithms. Love the community aspect!",
                                    color: "from-pink-400 to-pink-500"
                                },
                                {
                                    name: "Rahul",
                                    quote: "The curated sheets are exactly what I needed. Interview prep became much easier.",
                                    color: "from-blue-400 to-blue-500"
                                }
                            ].map((testimonial, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex-shrink-0`} />
                                    <div className="bg-white rounded-lg p-3 border border-slate-200 flex-1">
                                        <p className="text-xs sm:text-sm text-slate-700">{testimonial.quote}</p>
                                        <p className="text-xs font-semibold text-slate-900 mt-2">{testimonial.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </MotionDiv>
            </div>
        </section>
    );
}
