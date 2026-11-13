"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

const MODEL_URL = "/assets/youran.glb";
const sections = ["about", "experience", "skills", "projects", "contact"];

const projects = [
  { title: "AI Keyboard", type: "Product UI · AI", copy: "UI solutions for AI Keyboard features, including user flows, layouts, component states, and high-fidelity screens.", outcome: "Kika · UI Design Intern · 2026" },
  { title: "UFC Macau Event Merchandise", type: "Visual design · Event", copy: "T-shirt concepts, graphic and layout variations, and event visuals developed through final design execution.", outcome: "Visual Designer · 2026" },
  { title: "StudyPal", type: "UI/UX design · AI learning", copy: "An AI-assisted learning project shaped through learning-scenario user needs, information architecture, and foundational interaction flows.", outcome: "Designpreneurs Hackathon · 2026" },
];

const particles = Array.from({ length: 48 }, (_, index) => ({
  left: `${6 + ((index * 29) % 88)}%`,
  top: `${14 + ((index * 37) % 72)}%`,
  delay: `${-((index * 0.43) % 6)}s`,
  duration: `${5.5 + (index % 5) * 0.8}s`,
  color: index % 5,
}));

function Navbar() {
  const [active, setActive] = useState("about");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("home");
    const heroObserver = hero ? new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), { rootMargin: "-72px 0px 0px" }) : null;
    heroObserver?.observe(hero!);
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setActive(id), { rootMargin: "-35% 0px -55%" });
      observer.observe(el);
      return observer;
    });
    return () => { heroObserver?.disconnect(); observers.forEach((o) => o?.disconnect()); };
  }, []);
  return (
    <nav className={`nav ${scrolled ? "nav--glass" : ""}`} aria-label="Primary navigation">
      <a className="monogram" href="#home" aria-label="Back to top">YZ</a>
      <div className="nav__links">
        {sections.map((id) => <a key={id} className={active === id ? "active" : ""} href={`#${id}`}>{id}</a>)}
      </div>
    </nav>
  );
}

function Character() {
  const group = useRef<THREE.Group>(null);
  const content = useRef<THREE.Group>(null);
  const pointerTarget = useRef(new THREE.Vector2());
  const pointerCurrent = useRef(new THREE.Vector2());
  const { scene } = useGLTF(MODEL_URL);
  const { viewport } = useThree();
  const normalized = useRef(false);

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      pointerTarget.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };
    const resetPointer = () => pointerTarget.current.set(0, 0);

    window.addEventListener("pointermove", updatePointer, { passive: true });
    document.documentElement.addEventListener("mouseleave", resetPointer);
    window.addEventListener("blur", resetPointer);
    return () => {
      window.removeEventListener("pointermove", updatePointer);
      document.documentElement.removeEventListener("mouseleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
    };
  }, []);

  useEffect(() => {
    if (!content.current || normalized.current) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 2.25 / Math.max(size.x, size.y, size.z);
    content.current.scale.setScalar(scale);
    content.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    normalized.current = true;
  }, [scene]);

  useFrame(({ clock }, delta) => {
    if (!group.current || !content.current) return;
    pointerCurrent.current.x = THREE.MathUtils.damp(pointerCurrent.current.x, pointerTarget.current.x, 9, delta);
    pointerCurrent.current.y = THREE.MathUtils.damp(pointerCurrent.current.y, pointerTarget.current.y, 9, delta);
    const p = Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
    const stops = [
      { p: 0, x: 0, y: -1.05, s: 1.08, r: 0 },
      { p: .17, x: 1.9, y: -.25, s: .98, r: -.08 },
      { p: .34, x: 2.05, y: -.35, s: 1.03, r: -.06 },
      { p: .52, x: -2.2, y: -.2, s: .82, r: .12 },
      { p: .70, x: 1.95, y: -.4, s: .82, r: -.14 },
      { p: .86, x: -1.9, y: -.35, s: .88, r: .12 },
      { p: 1, x: 1.7, y: -1.05, s: .92, r: -.2 },
    ];
    let a = stops[0], b = stops[1];
    for (let i = 0; i < stops.length - 1; i++) if (p >= stops[i].p && p <= stops[i + 1].p) { a = stops[i]; b = stops[i + 1]; break; }
    const t = THREE.MathUtils.smoothstep((p - a.p) / (b.p - a.p), 0, 1);
    const mobile = viewport.width < 7;
    let targetX = mobile ? 0 : THREE.MathUtils.lerp(a.x, b.x, t);
    if (!mobile) {
      const about = document.getElementById("about");
      const experience = document.getElementById("experience");
      const contact = document.getElementById("contact");
      if (about && experience && contact) {
        const exitStart = about.offsetTop + about.offsetHeight * .68;
        const exitEnd = experience.offsetTop + innerHeight * .12;
        const returnStart = contact.offsetTop - innerHeight * .62;
        const returnEnd = contact.offsetTop + innerHeight * .08;
        const y = window.scrollY;
        if (y >= exitStart && y < exitEnd) {
          targetX = THREE.MathUtils.lerp(targetX, 7.2, THREE.MathUtils.smoothstep((y - exitStart) / Math.max(1, exitEnd - exitStart), 0, 1));
        } else if (y >= exitEnd && y < returnStart) {
          targetX = 7.2;
        } else if (y >= returnStart) {
          targetX = THREE.MathUtils.lerp(7.2, 1.7, THREE.MathUtils.smoothstep((y - returnStart) / Math.max(1, returnEnd - returnStart), 0, 1));
        }
      }
    }
    const float = Math.sin(clock.elapsedTime * .85) * .045;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 3.2, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, THREE.MathUtils.lerp(a.y, b.y, t) + float, 3.2, delta);
    const scale = THREE.MathUtils.lerp(a.s, b.s, t) * (mobile ? .76 : 1);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, scale, 3, delta));
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, THREE.MathUtils.lerp(a.r, b.r, t), 4, delta);

    const gazeX = pointerCurrent.current.x;
    const gazeY = pointerCurrent.current.y;
    content.current.rotation.y = THREE.MathUtils.damp(content.current.rotation.y, gazeX * .785, 8, delta);
    content.current.rotation.x = THREE.MathUtils.damp(content.current.rotation.x, gazeY * -.1, 7, delta);
    content.current.rotation.z = THREE.MathUtils.damp(content.current.rotation.z, gazeX * -.025, 6, delta);
  });

  return <group ref={group}><group ref={content}><primitive object={scene} /></group></group>;
}

function CharacterScene() {
  return (
    <div className="character-canvas" aria-hidden="true">
      <Canvas dpr={[1, 1.65]} camera={{ position: [0, 0, 7], fov: 34 }} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={2.2} />
        <directionalLight position={[4, 5, 5]} intensity={3.2} />
        <directionalLight position={[-4, 2, 3]} intensity={1.2} color="#bdb3ff" />
        <Suspense fallback={null}><Character /></Suspense>
      </Canvas>
    </div>
  );
}

function Portfolio() {
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    useGLTF.preload(MODEL_URL);
    gsap.registerPlugin(ScrollTrigger);
    const cleanups: Array<() => void> = [];
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const direction = el.dataset.reveal;
        const from = direction === "left" ? { x: -56, opacity: 0 } : direction === "right" ? { x: 56, opacity: 0 } : { y: 36, opacity: 0 };
        gsap.fromTo(el, from, { x: 0, y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 84%", once: true } });
      });
      gsap.utils.toArray<HTMLElement>(".project-card").forEach((el) => gsap.fromTo(el, { scale: .94, opacity: 0 }, { scale: 1, opacity: 1, duration: .85, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 87%", once: true } }));
      gsap.to(".hero__copy", { y: -90, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "75% top", scrub: true } });
      gsap.to(".hero .bubble--left", { x: -28, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero .bubble--right", { x: 28, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.from(".hero .bubble--left span", { x: -190, opacity: 0, stagger: .12, duration: 1, ease: "power3.out", delay: .25 });
      gsap.from(".hero .bubble--right span", { x: 190, opacity: 0, stagger: .12, duration: 1, ease: "power3.out", delay: .25 });
      gsap.fromTo(".about .particle-field", { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: ".about", start: "top 76%", once: true } });
      gsap.matchMedia().add("(min-width: 801px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => gsap.fromTo(el, { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: el.closest(".section") || el, start: "top bottom", end: "bottom top", scrub: .8 } }));
      });

      gsap.fromTo(".timeline__item", { y: 55, opacity: 0, scale: .92 }, {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: .13,
        duration: .9,
        ease: "back.out(1.2)",
        scrollTrigger: { trigger: ".timeline", start: "top 78%", once: true },
      });
      gsap.fromTo(".process-step", { scale: .55, opacity: 0, y: 30 }, {
        scale: 1,
        opacity: 1,
        y: 0,
        stagger: .12,
        duration: .8,
        ease: "back.out(1.5)",
        scrollTrigger: { trigger: ".process-track", start: "top 82%", once: true },
      });
      gsap.fromTo(".workflow-tool", { x: -35, opacity: 0 }, {
        x: 0,
        opacity: 1,
        stagger: .1,
        duration: .75,
        ease: "power3.out",
        scrollTrigger: { trigger: ".workflow-track", start: "top 82%", once: true },
      });

      gsap.utils.toArray<HTMLElement>(".project-card").forEach((card) => {
        const onMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          gsap.to(card, { rotateY: x * 7, rotateX: y * -7, y: -8, transformPerspective: 900, duration: .35, ease: "power2.out" });
        };
        const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: .65, ease: "elastic.out(1,.45)" });
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
        });
      });

      gsap.utils.toArray<HTMLElement>(".outline-button,.primary-button").forEach((button) => {
        const onMove = (event: PointerEvent) => {
          const rect = button.getBoundingClientRect();
          gsap.to(button, { x: (event.clientX - rect.left - rect.width / 2) * .18, y: (event.clientY - rect.top - rect.height / 2) * .18, duration: .3, ease: "power2.out" });
        };
        const onLeave = () => gsap.to(button, { x: 0, y: 0, duration: .7, ease: "elastic.out(1,.4)" });
        button.addEventListener("pointermove", onMove);
        button.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          button.removeEventListener("pointermove", onMove);
          button.removeEventListener("pointerleave", onLeave);
        });
      });

      const onParticleMove = (event: PointerEvent) => {
        const x = (event.clientX / window.innerWidth - .5) * 30;
        const y = (event.clientY / window.innerHeight - .5) * 24;
        gsap.to(".particle-field", { x, y, duration: 1.1, ease: "power2.out", overwrite: "auto" });
      };
      window.addEventListener("pointermove", onParticleMove, { passive: true });
      cleanups.push(() => window.removeEventListener("pointermove", onParticleMove));
    }, main);
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, []);

  return (
    <main ref={main}>
      <Navbar /><CharacterScene />
      <section className="hero section" id="home">
        <div className="particle-field" aria-hidden="true">
          {particles.map((particle, index) => (
            <i
              key={index}
              className={`particle particle--${particle.color}`}
              style={{ left: particle.left, top: particle.top, animationDelay: particle.delay, animationDuration: particle.duration }}
            />
          ))}
        </div>
        <div className="hero__copy">
          <h1>Hi, I’m Youran</h1>
          <p className="hero__subtitle">Visual Designer · UI/UX Designer</p>
        </div>
        <div className="glow hero__glow" />
        <div className="bubble-stack bubble--left"><span>UI/UX Design</span><span>Visual Design</span><span>Design Systems</span></div>
        <div className="bubble-stack bubble--right"><span>AI Workflow</span><span>Creative Coding</span><span>Prototyping</span></div>
      </section>

      <section className="philosophy section" id="philosophy">
        <div className="philosophy__copy" data-reveal="left" data-parallax>
          <h2>Design is not only<br />how it looks.<br />It’s <em>how people feel.</em></h2>
          <p>I use visual systems, thoughtful interaction, and clear communication to carry ideas from early concepts through final execution.</p>
        </div>
        <div className="glow philosophy__glow" />
      </section>

      <section className="about section" id="about">
        <div className="particle-field particle-field--about" aria-hidden="true">
          {particles.map((particle, index) => (
            <i
              key={index}
              className={`particle particle--${particle.color}`}
              style={{ left: particle.left, top: particle.top, animationDelay: particle.delay, animationDuration: particle.duration }}
            />
          ))}
        </div>
        <div className="about__copy" data-reveal="left" data-parallax>
          <h2>Hi, I’m Youran (Selina) Zhao</h2>
          <p>I’m a visual and UI/UX designer with a foundation in visual systems, layout, and graphic communication. I carry projects from early concepts through final execution and use AI tools to explore creative directions, generate variations, and accelerate iteration.</p>
          <p>I balance creative quality with efficient delivery, grounding design decisions in usage contexts and communication goals.</p>
          <a className="outline-button" href="#experience">Read more <span>→</span></a>
        </div>
        <div className="glow about__glow" />
      </section>

      <section className="experience section" id="experience">
        <div className="section-heading" data-reveal="left"><h2>Education & experience</h2><p>My education and recent design experience, presented exactly as listed in my résumé.</p></div>
        <h3 className="timeline-label" data-reveal="left">Education</h3>
        <div className="education-grid" data-reveal="up">
          <article className="timeline__item" tabIndex={0}>
            <h3>Parsons School of Design</h3>
            <strong>BFA in Communication Design</strong>
            <p>GPA 3.7 · Top 15% of the program · Four-year merit scholarship</p>
            <small>Aug 2023 - May 2026</small>
          </article>
          <article className="timeline__item" tabIndex={0}>
            <h3>NYU Tisch School of the Arts</h3>
            <strong>Bachelor&apos;s Program in Interaction Design</strong>
            <p>Interaction design, creative technology, and digital media innovation</p>
            <small>Sep 2026 - Present</small>
          </article>
        </div>
        <h3 className="timeline-label" data-reveal="left">Internship & work experience</h3>
        <div className="timeline" data-reveal="up">
          {[
            ["Jul 2026 - Present", "Kika · AI Keyboard", "UI Design Intern", "Product UI, Figma components, and interaction states"],
            ["Mar 2026 - May 2026", "UFC Macau Event Merchandise Design", "Visual Designer", "T-shirt concepts and event visuals"],
            ["Jan 2026 - Feb 2026", "Designpreneurs Hackathon", "UI/UX Designer", "StudyPal AI-assisted learning project"],
            ["May 2025 - Jul 2025", "Beijing Meitu Zhijia Technology Co., Ltd.", "Visual Designer", "Brand campaigns, events, and long-form graphics"],
          ].map(([year, company, role, place]) => (
            <article className="timeline__item" key={company} tabIndex={0}>
              <i className="timeline__node" />
              <h3>{company}</h3>
              <strong>{role}</strong>
              <p>{place}</p>
              <small>{year}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="skills section" id="skills">
        <div className="section-heading centered" data-reveal="up"><h2>Skills & tools</h2><p>Blending design thinking, visual craft, and technology.</p></div>
        <div className="skills-cloud">
          {["UI/UX Design", "Visual Design", "Figma", "Photoshop", "Illustrator", "InDesign", "After Effects", "Premiere Pro", "Framer", "Adobe XD", "Prototyping", "Prompt Design"].map((skill, i) => <motion.span key={skill} className={`skill skill--${i % 4}`} whileHover={{ scale: 1.08, y: -6 }} transition={{ type: "spring", stiffness: 250, damping: 15 }}>{skill}</motion.span>)}
        </div>
      </section>

      <section className="process section" id="process">
        <div className="process__intro" data-reveal="left">
          <h2>From concept<br />to final delivery.</h2>
          <p>A practical workflow grounded in visual exploration, clear structure, iteration, and production-ready execution.</p>
        </div>
        <div className="process-track" data-reveal="up">
          {[
            ["Explore", "Concept"],
            ["Organize", "Structure"],
            ["Create", "Design"],
            ["Iterate", "Refine"],
            ["Prepare", "Deliver"],
          ].map(([verb, label], index) => (
            <div className="process-step" key={label}>
              <div className="process-step__mark"><span>{verb}</span></div>
              <strong>{label}</strong>
              {index < 4 && <i />}
            </div>
          ))}
        </div>
        <div className="glow process__glow" />
      </section>

      <section className="workflow section" id="workflow">
        <div className="workflow__intro" data-reveal="left">
          <h2>AI-assisted exploration,<br />used with intention.</h2>
          <p>Tools listed in my résumé for image generation, visual style control, prompt design, and workflow optimization.</p>
        </div>
        <div className="workflow-track" data-reveal="up">
          {[
            ["M", "Midjourney"],
            ["NB", "Nano Banana"],
            ["FL", "Flora"],
            ["P", "Prompt Design"],
          ].map(([mark, label]) => (
            <div className="workflow-tool" key={label}>
              <div className="workflow-tool__mark" aria-hidden="true">{mark}</div>
              <strong>{label}</strong>
            </div>
          ))}
        </div>
        <div className="glow workflow__glow" />
      </section>

      <section className="projects section" id="projects">
        <div className="section-heading" data-reveal="left"><h2>Selected work</h2><p>Selected product, visual, and AI-assisted design work from my recent experience.</p></div>
        <div className="projects-grid">
          {projects.map((project, index) => <article className={`project-card project-card--${index + 1}`} key={project.title}><div className="project-meta"><p>{project.type}</p><h3>{project.title}</h3><p>{project.copy}</p><span className="project-outcome">{project.outcome}</span></div></article>)}
        </div>
      </section>

      <section className="contact section" id="contact">
        <div className="contact__copy" data-reveal="left"><h2>Have an idea?<br /><em>Let’s talk.</em></h2><p>For portfolio and collaboration inquiries, contact me by email.</p><a className="primary-button" href="mailto:3345217912@qq.com">3345217912@qq.com <span aria-hidden="true">↗</span></a></div>
        <p className="footer-note">© 2026 Youran (Selina) Zhao.</p>
      </section>
    </main>
  );
}

export default Portfolio;
