import FuelHero from "@/components/FuelHero";
import FuelAbout from "@/components/FuelAbout";
import FuelExpertise from "@/components/FuelExpertise";
import FuelProjects from "@/components/FuelProjects";
import FuelContact from "@/components/FuelContact";

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white">
      <FuelHero />
      <FuelAbout />
      <FuelExpertise />
      <FuelProjects />
      <FuelContact />
    </div>
  );
}
