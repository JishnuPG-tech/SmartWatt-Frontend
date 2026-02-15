# Contributing to SmartWatt Frontend

Thank you for your interest in contributing to SmartWatt Frontend! This guide will help you get started with contributing to our project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Component Guidelines](#component-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

---

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (especially for UI issues)
- **Browser and OS information**
- **Console errors** (if applicable)

**Template:**

```markdown
**Description:**
Brief description of the bug

**To Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
What should happen

**Screenshots:**
If applicable, add screenshots

**Environment:**
- Browser: [e.g., Chrome 120, Firefox 115]
- OS: [e.g., Windows 11, macOS 14]
- Device: [e.g., Desktop, iPhone 14]

**Console Errors:**
```
Paste any console errors here
```
```

### 💡 Suggesting Features

We love new ideas! When proposing features:

1. **Check existing feature requests**
2. **Describe the problem** it solves
3. **Provide mockups or examples**
4. **Consider user experience impact**
5. **Think about implementation complexity**

### 🎨 UI/UX Improvements

We welcome design improvements! Please:

- Consider accessibility (WCAG 2.1)
- Maintain consistency with existing design
- Test on multiple screen sizes
- Ensure dark mode compatibility (future)

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Git
- Code editor (VS Code recommended)

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/SmartWatt-Frontend.git
cd SmartWatt-Frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
# Required: NEXT_PUBLIC_BACKEND_URL
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your changes.

### 5. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix-name
```

---

## Coding Standards

### TypeScript

We use TypeScript for type safety:

```typescript
// ✅ Good: Explicit types
interface ApplianceProps {
  name: string;
  power: number;
  hoursPerDay: number;
  onUpdate: (id: string) => void;
}

const ApplianceCard: React.FC<ApplianceProps> = ({ name, power }) => {
  // Component logic
};

// ❌ Bad: No types
const ApplianceCard = ({ name, power }) => {
  // Component logic
};
```

### Code Style

- **Use ES6+** features (arrow functions, destructuring, etc.)
- **Functional components** with hooks (no class components)
- **Named exports** for components
- **Const** for component definitions

```typescript
// ✅ Good
export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};

// ❌ Bad
export default function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

### File Naming

- **Components**: PascalCase (e.g., `ApplianceCard.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAppliances.ts`)
- **Types**: PascalCase (e.g., `Appliance.ts`)

---

## Component Guidelines

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

// 2. Type definitions
interface ComponentProps {
  title: string;
  value: number;
}

// 3. Component
export const Component: React.FC<ComponentProps> = ({ title, value }) => {
  // 4. State and hooks
  const [isActive, setIsActive] = useState(false);

  // 5. Event handlers
  const handleClick = () => {
    setIsActive(!isActive);
  };

  // 6. Render
  return (
    <Card onClick={handleClick}>
      <h3>{title}</h3>
      <p>{formatCurrency(value)}</p>
    </Card>
  );
};
```

### Accessibility

All components must be accessible:

```typescript
// ✅ Good: Proper ARIA labels and semantic HTML
<button
  aria-label="Delete appliance"
  onClick={handleDelete}
>
  <TrashIcon />
</button>

// ❌ Bad: No accessibility
<div onClick={handleDelete}>
  <TrashIcon />
</div>
```

### Responsive Design

Use Tailwind's responsive utilities:

```typescript
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
  {/* Content */}
</div>
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance

### Examples

```bash
feat(dashboard): add appliance consumption chart

- Implemented pie chart using Recharts
- Added hover tooltips with detailed breakdown
- Mobile responsive design

Closes #45

---

fix(form): resolve validation error for power input

The power input was not accepting decimal values.
Changed input type and validation regex.

Fixes #78

---

docs(readme): update installation instructions
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Documentation updated
- [ ] Commit messages follow conventions

### PR Checklist

```markdown
## Description
What does this PR do?

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] UI improvement
- [ ] Performance improvement
- [ ] Documentation update

## Screenshots
If applicable, add before/after screenshots

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated checks** run (linting, build, tests)
2. **Code review** by maintainers
3. **Address feedback** and push updates
4. **Approval and merge** by maintainers

---

## Testing Guidelines

### Writing Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ApplianceCard } from './ApplianceCard';

describe('ApplianceCard', () => {
  const mockProps = {
    name: 'Ceiling Fan',
    power: 75,
    hoursPerDay: 8,
    onDelete: jest.fn(),
  };

  it('renders appliance name', () => {
    render(<ApplianceCard {...mockProps} />);
    expect(screen.getByText('Ceiling Fan')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', () => {
    render(<ApplianceCard {...mockProps} />);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

---

## Project-Specific Guidelines

### State Management

Use React hooks for state management:

```typescript
// ✅ Good: Context for global state
const ApplianceContext = createContext<ApplianceContextType | null>(null);

export const useAppliances = () => {
  const context = useContext(ApplianceContext);
  if (!context) throw new Error('useAppliances must be used within provider');
  return context;
};
```

### API Calls

Use the centralized API client:

```typescript
// ✅ Good: Use the API client
import { api } from '@/lib/api';

const fetchPrediction = async (data: ApplianceData) => {
  try {
    const result = await api.predictAppliance(data);
    return result;
  } catch (error) {
    console.error('Prediction failed:', error);
    throw error;
  }
};
```

### Error Handling

Always handle errors gracefully:

```typescript
// ✅ Good: User-friendly error handling
try {
  await saveAppliance(data);
  toast.success('Appliance saved successfully');
} catch (error) {
  toast.error('Failed to save appliance. Please try again.');
  console.error(error);
}
```

---

## Need Help?

- **Questions**: Open a [Discussion](https://github.com/JishnuPG-tech/SmartWatt-Frontend/discussions)
- **Bugs**: Open an [Issue](https://github.com/JishnuPG-tech/SmartWatt-Frontend/issues)
- **Chat**: [Join our Discord](#) (if available)

---

Thank you for contributing to SmartWatt! 🙏

**Happy Coding!** 💻✨
