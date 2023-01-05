const ContentFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-base-200">
      <div className="max-w-7xl mx-auto py-12 flex flex-col md:flex-row justify-center items-center content-center gap-4">
        <p>Playground for decentralized identifiers and verifiable credentials</p>
        <p className="hidden md:block">&bull;</p>
        <p>&copy; {year} attested.tech</p>
      </div>
    </footer>
  );
};
export default ContentFooter;
