import Hero from '../components/homePage/Hero';
import Navbar from '../components/navbar/Navbar';
import HomeSections from '../components/homePage/HomeSections';

function HomePage() {
    return (
        <div className="min-h-screen bg-canvas">
            <Navbar />
            <Hero />
            <HomeSections />
        </div>
    );
}

export default HomePage;
