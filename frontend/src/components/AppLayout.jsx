import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-paper-50 dark:bg-[var(--bg-app)]">
      <Sidebar />
      <main className="lg:pl-60">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;