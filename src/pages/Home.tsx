import FuelHero from "@/components/FuelHero";
import FuelProfile from "@/components/FuelProfile";
import FuelAbout from "@/components/FuelAbout";
import FuelStats from "@/components/FuelStats";
import FuelExpertise from "@/components/FuelExpertise";
import FuelProjects from "@/components/FuelProjects";
import FuelContact from "@/components/FuelContact";

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white">
      <FuelHero />
      <FuelProfile />
      <FuelAbout />
      <FuelStats />
      <FuelExpertise />
      <FuelProjects />
      <FuelContact />
    </div>
  );
}