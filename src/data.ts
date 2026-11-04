/** Content migrated from MatteoCalvanico/AngularPortfolio (main, November 2026). */
export interface PortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon?: string;
  image?: string;
  tags?: string[];
  links?: { label: string; url: string }[];
  relatedProjects?: string[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  items: PortfolioItem[];
}

const asset = (name: string): string =>
  `${import.meta.env.BASE_URL}assets/${name}`;
const cvUrl =
  "https://github.com/MatteoCalvanico/CV/blob/ENG/Matteo-Calvanico-CV-ENG.pdf";

export const profile = {
  name: "Matteo Calvanico",
  role: "Full-Stack Software Engineer",
  image: asset("profile.png"),
  location: "Cesena, Italy",
};

const projects: PortfolioItem[] = [
  {
    id: "game-vault",
    title: "Game Vault",
    subtitle: "Android · Game collection",
    icon: "gamepad",
    description:
      "An Android app for tracking your game collection, with rating and search capabilities.",
    image: asset("game-vault.png"),
    tags: ["Kotlin", "Gradle", "Android Studio"],
    links: [
      {
        label: "View source code",
        url: "https://github.com/MatteoCalvanico/Mobile24-CalvanicoMonti-GameVault",
      },
      {
        label: "Google Play",
        url: "https://play.google.com/store/apps/details?id=it.unibo.gamevault",
      },
    ],
  },
  {
    id: "virtual-casino",
    title: "Virtual Casinò",
    subtitle: "Desktop · Casino simulation",
    icon: "gamepad",
    description:
      "A desktop application in Java simulating casino games, including Blackjack, Roulette and dice.",
    image: asset("virtual-casino.png"),
    tags: ["Java", "Gradle"],
    links: [
      {
        label: "View source code",
        url: "https://github.com/MatteoCalvanico/pss23-Calvanico-Monti-Ghinelli-VirtualCasino",
      },
    ],
  },
  {
    id: "geteat",
    title: "GetEat",
    subtitle: "Web · Restaurant management",
    icon: "globe",
    description: "A web application for managing restaurants.",
    image: asset("geteat.png"),
    tags: [
      "Vue.js",
      "Node.js",
      "HTML5",
      "Sass",
      "Express.js",
      "Bootstrap",
      "TypeScript",
    ],
    links: [
      {
        label: "View source code",
        url: "https://github.com/MatteoCalvanico/GetEat",
      },
    ],
  },
  {
    id: "protocrpg",
    title: "ProtoCRPG",
    subtitle: "Game development · Godot",
    icon: "gamepad",
    description:
      "A CRPG prototype made with Godot 4.3, designed as a template for other projects.",
    image: asset("protocrpg.png"),
    tags: ["Godot"],
    links: [
      {
        label: "View source code",
        url: "https://github.com/MatteoCalvanico/ProtoCRPG",
      },
    ],
  },
  {
    id: "doomclone",
    title: "DoomClone",
    subtitle: "Game development · C++",
    icon: "gamepad",
    description: "A C++ game inspired by Doom and Wolfenstein 3D.",
    image: asset("doomclone.png"),
    tags: ["C++"],
    links: [
      {
        label: "View source code",
        url: "https://github.com/MatteoCalvanico/DoomClone",
      },
    ],
  },
  {
    id: "embedded-project",
    title: "EmbeddedProject",
    subtitle: "IoT · Smart parking",
    icon: "tools",
    description:
      "An IoT project using an ESP32 and a web application to manage and check parking lot availability.",
    image: asset("embedded-project.png"),
    tags: ["Arduino", "C"],
    links: [
      {
        label: "View source code",
        url: "https://github.com/MatteoCalvanico/EmbeddedProject",
      },
      {
        label: "Wokwi simulation",
        url: "https://wokwi.com/projects/389703246864781313",
      },
    ],
  },
  {
    id: "multiclass",
    title: "MultiClass Classification",
    subtitle: "Machine learning · Image classification",
    icon: "layers",
    description: "A Python project for multi-class classification of fruits.",
    image: asset("multiclass.jpg"),
    tags: ["Python", "OpenCV", "Pandas", "Scikit-Learn", "PyTorch"],
    links: [
      {
        label: "View source code",
        url: "https://github.com/MatteoCalvanico/MultiClass-Classification",
      },
    ],
  },
  {
    id: "mako",
    title: "Mako",
    subtitle: "Web · Port shift management",
    icon: "globe",
    description: "A web application for managing shifts in a naval port.",
    image: asset("mako.png"),
    tags: ["C#", ".NET", "HTML5", "Sass", "Bootstrap", "TypeScript"],
    links: [
      {
        label: "View source code",
        url: "https://github.com/MatteoCalvanico/Mako",
      },
    ],
  },
];

type SkillSpec = [
  name: string,
  subtitle: string,
  description: string,
  icon?: string,
];

const languageSpecs: SkillSpec[] = [
  [
    "Java",
    "Programming language",
    "Object-oriented programming for desktop and backend applications.",
  ],
  [
    "C#",
    "Programming language",
    "Application development in the .NET ecosystem.",
  ],
  [
    "C++",
    "Programming language",
    "Systems and game programming with direct control over performance.",
  ],
  [
    "Kotlin",
    "Programming language",
    "Modern programming for Android applications.",
  ],
  [
    "TypeScript",
    "Programming language",
    "Typed JavaScript for frontend and backend applications.",
  ],
  [
    "JavaScript",
    "Programming language",
    "Programming for interactive web applications.",
  ],
  [
    "Python",
    "Programming language",
    "Programming for data analysis, computer vision and machine learning.",
  ],
  ["C", "Programming language", "Low-level programming for embedded systems."],
  ["HTML5", "Markup language", "Semantic structure for web applications."],
  [
    "CSS",
    "Style sheet language",
    "Presentation and responsive layouts for the web.",
  ],
  [
    "Sass",
    "Style sheet language",
    "A CSS extension for organizing application styles.",
  ],
];

const frameworkSpecs: SkillSpec[] = [
  [
    "Vue.js",
    "Frontend framework",
    "A component-based framework for interactive web interfaces.",
  ],
  [
    "React",
    "UI library",
    "A library for building component-based user interfaces.",
  ],
  [
    "Angular",
    "Frontend framework",
    "A framework for building structured web applications.",
  ],
  [
    ".NET",
    "Application platform",
    "A development platform for web and desktop applications.",
  ],
  [
    "Spring",
    "Backend framework",
    "A framework for Java applications and backend services.",
  ],
  [
    "Express.js",
    "Backend framework",
    "A web framework for Node.js applications and APIs.",
  ],
  ["Fastify", "Backend framework", "A web framework for Node.js services."],
  [
    "Blazor",
    "Web framework",
    "A framework for building web interfaces with C#.",
  ],
  [
    "Bootstrap",
    "UI toolkit",
    "A toolkit for responsive web layouts and interface components.",
  ],
  [
    "TensorFlow",
    "Machine learning library",
    "A library for machine learning and neural networks.",
  ],
  [
    "PyTorch",
    "Machine learning library",
    "A library for tensor computation and deep learning.",
  ],
  [
    "OpenCV",
    "Computer vision library",
    "A library for image processing and computer vision.",
  ],
  [
    "Pandas",
    "Data analysis library",
    "A library for working with structured data in Python.",
  ],
  [
    "Scikit-Learn",
    "Machine learning library",
    "A Python library for classification and other machine learning workflows.",
  ],
  [
    "Mongoose",
    "Data modeling library",
    "A MongoDB object modeling library for Node.js.",
  ],
  [
    "Zod",
    "Validation library",
    "A TypeScript-first library for schema validation.",
  ],
];

const toolSpecs: SkillSpec[] = [
  [
    "Godot",
    "Game engine",
    "An open-source engine for creating 2D and 3D games.",
    "gamepad",
  ],
  [
    "Android Studio",
    "Development environment",
    "An integrated development environment for Android applications.",
    "terminal",
  ],
  [
    "Git",
    "Version control",
    "Distributed version control for software projects.",
    "github",
  ],
  [
    "Gradle",
    "Build tool",
    "Build automation for Java and Kotlin projects.",
    "tools",
  ],
  [
    "Arduino",
    "Embedded development",
    "Tools and an ecosystem for programming embedded hardware.",
    "tools",
  ],
  [
    "AWS",
    "Cloud platform",
    "Cloud services for backend applications and infrastructure.",
    "cloud",
  ],
  [
    "Google Cloud",
    "Cloud platform",
    "A platform of cloud computing services.",
    "cloud",
  ],
  [
    "Docker",
    "Container platform",
    "Tools for packaging and running applications in containers.",
    "tools",
  ],
  [
    "Jenkins",
    "Automation server",
    "A server for automating software build and delivery workflows.",
    "tools",
  ],
  [
    "Node.js",
    "JavaScript runtime",
    "A JavaScript runtime for backend services and development tools.",
    "terminal",
  ],
  [
    "MySQL",
    "Relational database",
    "A relational database management system.",
    "database",
  ],
  [
    "SQLite",
    "Embedded database",
    "A self-contained SQL database engine.",
    "database",
  ],
  [
    "DBeaver",
    "Database tool",
    "A desktop tool for working with databases.",
    "database",
  ],
  [
    "Postman",
    "API development",
    "A tool for developing and testing APIs.",
    "tools",
  ],
  [
    "Figma",
    "Design tool",
    "A collaborative tool for interface design and prototyping.",
    "tools",
  ],
  [
    "Kong",
    "API gateway",
    "An API gateway for managing service traffic.",
    "cloud",
  ],
];

const allSkillNames = [...languageSpecs, ...frameworkSpecs, ...toolSpecs].map(
  ([name]) => name,
);
const bachelorExcluded = new Set([
  "Godot",
  "Angular",
  "C++",
  "React",
  "Spring",
  "DBeaver",
  "Kong",
  "Fastify",
  "Mongoose",
  "Zod",
]);

const experiences: PortfolioItem[] = [
  {
    id: "dma-engineer",
    title: "Software Engineer",
    subtitle: "DMA · January 2026 — Present",
    icon: "briefcase",
    description:
      "Cesena, Italy. Full-stack development across AWS-based backend projects and single-page applications built with Next.js and React, as well as projects using HubSpot CMS.",
    image: asset("dma.svg"),
    tags: ["AWS", "React", "TypeScript", "Node.js"],
    links: [{ label: "Visit DMA", url: "https://www.dma.it/" }],
  },
  {
    id: "masters",
    title: "Master’s Degree",
    subtitle: "University of Bologna · October 2026 — Present",
    icon: "graduation",
    description:
      "Master’s Degree in Computer Science, Bologna, Italy. I am following the A: TECNICHE DEL SOFTWARE curriculum. My studies include software architecture, quantum computing, databases and artificial intelligence, deep learning, multimedia data management, computer graphics, and XR and gaming.",
    image: asset("unibo.png"),
    links: [
      {
        label: "Degree programme",
        url: "https://corsi.unibo.it/2cycle/ComputerScience",
      },
    ],
  },
  {
    id: "bachelors",
    title: "Bachelor’s Degree",
    subtitle: "University of Bologna · 2022 — 2025",
    icon: "graduation",
    description:
      "Bachelor’s Degree in Computer System Technologies, Cesena, Italy. During my studies, I explored algorithms and data structures, embedded systems, web and cloud technologies, combining theoretical understanding with practical, hands-on experience. Through projects and two curricular internships (1,200+ hours in total), I developed technical skills and a problem-solving mindset, preparing me for roles in software development.",
    image: asset("unibo.png"),
    tags: allSkillNames.filter((name) => !bachelorExcluded.has(name)),
    links: [
      {
        label: "Degree programme",
        url: "https://corsi.unibo.it/1cycle/ComputerSystemTechnologies",
      },
    ],
  },
  {
    id: "dma-internship",
    title: "Internship · DMA",
    subtitle: "Cesena, Italy · April — August 2025",
    icon: "briefcase",
    description:
      "University internship focused on web and cloud development using AWS. I worked on a control panel where a customer service operator can monitor the current and past status of devices used by consumers, enabling targeted support in case of faults or other issues. The application, named ECC Dashboard, became the basis for my thesis.",
    image: asset("dma.svg"),
    tags: [
      "React",
      "Kong",
      "Mongoose",
      "Fastify",
      "Zod",
      "TypeScript",
      "Node.js",
      "Docker",
      "AWS",
    ],
    links: [{ label: "Visit DMA", url: "https://www.dma.it/" }],
  },
  {
    id: "maggioli-internship",
    title: "Internship · Maggioli",
    subtitle: "Maggioli S.p.A. · November 2024 — March 2025",
    icon: "briefcase",
    description:
      "Santarcangelo di Romagna, Italy. University internship at Maggioli S.p.A., an Italian company providing software solutions for public administration. I worked in the development team on both frontend and backend software, learning to navigate a large, established codebase and collaborate with a large team, including remotely.",
    image: asset("maggioli.png"),
    tags: ["Angular", "Java", "Spring", "DBeaver"],
    links: [{ label: "Visit Maggioli", url: "https://www.maggioli.com/" }],
  },
  {
    id: "high-school",
    title: "High School Diploma",
    subtitle: "ITT Blaise Pascal · 2017 — 2022",
    icon: "graduation",
    description:
      "Computer Science and Telecommunication Systems, Cesena, Italy. I completed high school with a specialization in Computer Science and Telecommunication Systems, studying the foundations of programming, networking, electronics and more.",
    image: asset("pascal.png"),
    tags: ["C#", ".NET", "HTML5", "CSS", "JavaScript", "MySQL"],
    links: [
      {
        label: "Visit ITT Blaise Pascal",
        url: "https://www.ispascalcomandini.it/itt-b-pascal/",
      },
    ],
  },
];

function skillItems(specs: SkillSpec[], defaultIcon: string): PortfolioItem[] {
  return specs.map(([title, subtitle, definition, icon]) => {
    const related = projects.filter((project) => project.tags?.includes(title));
    const work = experiences.filter(
      (experience) =>
        experience.icon === "briefcase" && experience.tags?.includes(title),
    );
    const context = [
      related.length
        ? `Featured in ${related.map((project) => project.title).join(", ")}.`
        : "",
      work.length
        ? `Part of my work with ${[...new Set(work.map((experience) => (experience.id.startsWith("dma") ? "DMA" : "Maggioli")))].join(" and ")}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    const skillId =
      title === "C++"
        ? "cplusplus"
        : title === "C#"
          ? "csharp"
          : title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
    return {
      id: skillId,
      title,
      subtitle,
      icon: `brand:${skillId}`,
      description: `${definition} ${context || "Part of my development toolkit and studies."}`,
      relatedProjects: related.map((project) => project.id),
    };
  });
}

export const categories: Category[] = [
  {
    id: "profile",
    label: "Profile",
    icon: "user",
    items: [
      {
        id: "about",
        title: "Hello, I’m Matteo.",
        subtitle: "Full-Stack Software Engineer",
        icon: "user",
        description:
          "I’m a Full-Stack Software Engineer with a Bachelor’s Degree in Computer System Technologies from the University of Bologna. I work across frontend and backend development, and I’m pursuing a Master’s Degree in Computer Science. My interests bring together programming, game development, cinema and travel.",
        image: profile.image,
        tags: [
          "Software engineering",
          "Game development",
          "University of Bologna",
        ],
        links: [{ label: "View my CV", url: cvUrl }],
      },
      {
        id: "games",
        title: "Video games",
        subtitle: "Playing, developing, designing",
        icon: "gamepad",
        description:
          "Video games are more than a hobby: I’m also taking my first steps as a game developer and designer.",
        relatedProjects: [
          "protocrpg",
          "doomclone",
          "virtual-casino",
          "game-vault",
        ],
      },
      {
        id: "cinema",
        title: "Cinema",
        subtitle: "Always another film to discover",
        icon: "film",
        description:
          "I’m a great fan of the seventh art, always looking for new films to see and discover.",
      },
      {
        id: "travel",
        title: "Travel",
        subtitle: "Places, people and perspectives",
        icon: "plane",
        description:
          "Since childhood, I’ve had the opportunity to visit my country, my continent and then the rest of the world. I love learning about new cultures, people and realities.",
      },
      {
        id: "cv",
        title: "Curriculum vitae",
        subtitle: "My résumé · English",
        icon: "document",
        description:
          "Read my English résumé for an overview of my education, professional experience and technical skills.",
        links: [{ label: "Open CV", url: cvUrl }],
      },
    ],
  },
  {
    id: "experience",
    label: "Experience",
    icon: "briefcase",
    items: experiences,
  },
  { id: "projects", label: "Projects", icon: "gamepad", items: projects },
  {
    id: "languages",
    label: "Languages",
    icon: "code",
    items: skillItems(languageSpecs, "code"),
  },
  {
    id: "frameworks",
    label: "Frameworks & Libraries",
    icon: "layers",
    items: skillItems(frameworkSpecs, "layers"),
  },
  {
    id: "tools",
    label: "Tools",
    icon: "tools",
    items: skillItems(toolSpecs, "tools"),
  },
  {
    id: "contacts",
    label: "Contacts",
    icon: "mail",
    items: [
      {
        id: "github",
        title: "GitHub",
        subtitle: "MatteoCalvanico",
        icon: "github",
        description:
          "Explore my repositories, source code and development projects.",
        links: [
          { label: "Open GitHub", url: "https://github.com/MatteoCalvanico" },
        ],
      },
      {
        id: "email",
        title: "Email",
        subtitle: "matteo.calvanico03@gmail.com",
        icon: "mail",
        description: "Get in touch by email.",
        links: [
          {
            label: "Write an email",
            url: "mailto:matteo.calvanico03@gmail.com",
          },
        ],
      },
      {
        id: "linkedin",
        title: "LinkedIn",
        subtitle: "Matteo Calvanico",
        icon: "linkedin",
        description:
          "Connect with me and find out more about my professional background.",
        links: [
          {
            label: "Open LinkedIn",
            url: "https://www.linkedin.com/in/matteo-calvanico/",
          },
        ],
      },
    ],
  },
];
