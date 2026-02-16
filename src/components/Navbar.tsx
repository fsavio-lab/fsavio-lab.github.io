import React, { memo } from 'react';

const navItems = [
  { label: 'Systems', href: '#projects' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Metrics', href: '#metrics' },
  { label: 'Contact', href: '#contact' },
];

const Navbar = memo(() => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-silver-light/50">
      <div className="container flex items-center justify-between h-20">
        <a href="#hero" className="font-display font-bold text-sm tracking-tight text-foreground">
          <img className="h-full w-16" src="/black-dense-logo/Group 10.png" alt="Logo" />
        </a>
        <div className="hidden sm:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-200 red-underline"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;
