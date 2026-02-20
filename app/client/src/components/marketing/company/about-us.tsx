import Link from "next/link";
import Image from "next/image";

const members = [
  {
    name: "Mazin Emad",
    role: "Frontend Developer",
    avatar: "/avatars/Mazin Emad.webp",
    linkedin: "https://www.linkedin.com/in/mazin0emd",
    portfolio: "https://mazin-emad.netlify.app/",
  },
  {
    name: "Mohamed Abolyazeed",
    role: "Backend Developer",
    avatar: "/avatars/Abolyazeed.jpg",
    linkedin:
      "https://www.linkedin.com/in/mohamed-abolyazeed-hashem-139ba0358/",
    portfolio: "http://abolyazeed.vercel.app/",
  },
  {
    name: "Abdelraouf Dahy",
    role: "AI Engineer",
    avatar: "/avatars/Moataz Rashwan.webp",
    linkedin: "https://www.linkedin.com/in/moataz-abdelraouf-390429290/",
    github: "https://github.com/Moataz899",
  },
  {
    name: "Ahmed Badawi",
    role: "Full Stack Developer",
    avatar: "/avatars/Badawi.jpg",
    linkedin: "https://linkedin.com/in/ahmedbadawihosny",
    github: "https://github.com/ahmedbadawihosny",
  },
  {
    name: "Andro",
    role: "Backend Developer",
    avatar: "/avatars/Andro Refaat.webp",
    linkedin: "https://www.linkedin.com/in/andro-refaat-a80081253/",
    github: "https://github.com/AndroRefaat",
  },
];

export default function AboutUSSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-5xl border-t px-6">
        <span className="text-caption -ml-6 -mt-3.5 block w-max bg-gray-50 px-6 dark:bg-gray-950">
          Team
        </span>
        <div className="mt-12 gap-4 sm:grid sm:grid-cols-2 md:mt-24">
          <div className="sm:w-2/5">
            <h2 className="text-3xl font-bold sm:text-4xl">Our team</h2>
          </div>
          <div className="mt-6 sm:mt-0">
            <p>
              During the working process, we perform regular fitting with the
              client because he is the only person who can feel whether a new
              suit fits or not.
            </p>
          </div>
        </div>
        <div className="mt-12 md:mt-24">
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member, index) => (
              <div key={index} className="group overflow-hidden">
                <Image
                  className="h-96 w-full rounded-md object-cover object-top transition-all duration-500 hover:grayscale-0 group-hover:h-[22.5rem] group-hover:rounded-xl"
                  src={member.avatar}
                  alt="team member"
                  width="826"
                  height="1239"
                />
                <div className="px-2 pt-2 sm:pb-0 sm:pt-4">
                  <div className="flex justify-between">
                    <h3 className="text-base font-medium transition-all duration-500 group-hover:tracking-wider">
                      {member.name}
                    </h3>
                    <span className="text-xs">_0{index + 1}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-muted-foreground inline-block translate-y-6 text-sm opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      {member.role}
                    </span>
                    <Link
                      href={member.linkedin}
                      target="_blank"
                      className="group-hover:text-primary-600 dark:group-hover:text-primary-400 inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      {" "}
                      LinkedIn
                    </Link>
                    {member.portfolio ? (
                      <Link
                        href={member.portfolio}
                        target="_blank"
                        className="group-hover:text-primary-600 dark:group-hover:text-primary-400 inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100"
                      >
                        {" "}
                        Portfolio
                      </Link>
                    ) : (
                      <Link
                        href={member.github}
                        target="_blank"
                        className="group-hover:text-primary-600 dark:group-hover:text-primary-400 inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100"
                      >
                        {" "}
                        GitHub
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
