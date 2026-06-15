import Hero from '../components/homePage/Hero';
import Navbar from '../components/navbar/Navbar';
import HomeSections from '../components/homePage/HomeSections';

function HomePage() {
    return (
        <>
            <div className="relative w-full overflow-hidden border-b-2 border-black">
                <Navbar />
                <div className="mx-4 sm:mx-6 lg:mx-8 border-l-2 border-r-2 border-black">
                    <Hero />
                </div>
            </div>
            <HomeSections />
        </>
    )
}

export default HomePage;
