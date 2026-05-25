import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TutorialsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4" style={{ paddingTop: 90 }}>
        <h1
          className="py-10 text-center text-[28px] font-normal uppercase"
          style={{ letterSpacing: "0.2em" }}
        >
          Tutorials
        </h1>
        <p
          className="text-center text-[15px]"
          style={{ color: "#686868", padding: "80px 0" }}
        >
          It seems we can&apos;t find what you&apos;re looking for.
        </p>
      </main>
      <Footer />
    </>
  );
}
