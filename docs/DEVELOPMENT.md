# Development Guide

## Getting Started with Development

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **pnpm**: Package manager (recommended)
- **Git**: Version control
- **VS Code**: Recommended IDE
- **Firebase Account**: For backend services

### Development Environment Setup

#### 1. Clone and Install
```bash
git clone <repository-url>
cd ytfcs-shg
pnpm install
```

#### 2. Environment Configuration
Create `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_dev_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_dev_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_dev_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_dev_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_dev_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_dev_measurement_id
```

#### 3. Start Development Server
```bash
pnpm dev
```

Application will be available at `http://localhost:3000`

---

## Project Architecture

### File Structure Philosophy
```
ytfcs-shg/
├── app/                      # Next.js App Router
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── caresync/            # Staff portal
│   └── patient/             # Patient portal
├── components/              # Reusable components
│   ├── ui/                  # Base UI components
│   └── [feature-components] # Feature-specific components
├── lib/                     # Utilities and configurations
│   ├── firebase/           # Firebase setup
│   ├── store/              # State management
│   ├── types/              # TypeScript definitions
│   └── utils.ts            # Helper functions
├── hooks/                   # Custom React hooks
└── public/                  # Static assets
```

### Key Architectural Decisions

#### 1. Next.js App Router
- File-based routing system
- Server and client components
- Automatic code splitting
- Built-in optimization

#### 2. TypeScript
- Strict type checking
- Enhanced developer experience
- Better refactoring support
- Compile-time error detection

#### 3. Zustand for State Management
- Lightweight and simple
- No boilerplate code
- TypeScript friendly
- Excellent performance

#### 4. Firebase Backend
- Real-time database
- Authentication system
- File storage
- Scalable infrastructure

---

## Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/feature-name

# Create pull request
```

### Commit Convention
Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/modifications
- `chore:` - Build process or auxiliary tool changes

### Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Hotfix branches

---

## Component Development

### Component Structure
```typescript
// Component template
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export function Component({ title, onAction }: ComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      await onAction?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button onClick={handleAction} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Action'}
      </Button>
    </div>
  );
}
```

### Component Guidelines

#### 1. Naming Convention
- PascalCase for components
- Descriptive and clear names
- Avoid generic names like `Component` or `Container`

#### 2. Props Interface
- Always define TypeScript interfaces
- Use optional properties when appropriate
- Document complex props with JSDoc

#### 3. State Management
- Use local state for component-specific data
- Use Zustand stores for shared state
- Minimize prop drilling

#### 4. Styling
- Use Tailwind CSS classes
- Follow responsive design patterns
- Use CSS variables for theme colors

### Custom Hooks Development

```typescript
// Custom hook template
import { useState, useEffect } from 'react';

interface UseDataHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useData<T>(url: string): UseDataHookReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch logic here
      const result = await fetch(url);
      setData(await result.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}
```

---

## State Management

### Zustand Store Pattern
```typescript
// Store template
import { create } from 'zustand';

interface Item {
  id: string;
  name: string;
  status: string;
}

interface ItemStore {
  items: Item[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
}

export const useItemStore = create<ItemStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch logic
      const items = await fetchItemsFromAPI();
      set({ items, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  addItem: (item) => {
    const newItem = { ...item, id: generateId() };
    set(state => ({ items: [...state.items, newItem] }));
  },

  updateItem: (id, updates) => {
    set(state => ({
      items: state.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  },

  deleteItem: (id) => {
    set(state => ({
      items: state.items.filter(item => item.id !== id)
    }));
  },
}));
```

### Store Organization
- One store per domain (doctors, rooms, statuses, etc.)
- Keep stores focused and cohesive
- Avoid deeply nested state
- Use computed values when possible

---

## Firebase Integration

### Configuration
```typescript
// lib/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Configuration from environment
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Firestore Operations
```typescript
// lib/firebase/operations.ts
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from './config';

export const firestoreOperations = {
  // Get all documents
  async getCollection<T>(collectionName: string): Promise<T[]> {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  },

  // Add document
  async addDocument<T>(collectionName: string, data: T): Promise<string> {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  },

  // Update document
  async updateDocument<T>(
    collectionName: string, 
    id: string, 
    updates: Partial<T>
  ): Promise<void> {
    await updateDoc(doc(db, collectionName, id), updates);
  },

  // Delete document
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    await deleteDoc(doc(db, collectionName, id));
  },
};
```

### Authentication Setup
```typescript
// lib/firebase/auth.ts
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from './config';

export const authOperations = {
  async signIn(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  async signUp(email: string, password: string) {
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  async signOut() {
    return await firebaseSignOut(auth);
  },
};
```

---

## Styling and UI

### Tailwind CSS Configuration
```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Custom healthcare colors
        healthcare: {
          blue: '#0ea5e9',
          green: '#10b981',
          red: '#ef4444',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### Component Styling Guidelines
```typescript
// Good: Responsive and semantic classes
<div className="flex flex-col gap-4 p-4 md:p-6 bg-background border rounded-lg">
  <h2 className="text-lg font-semibold text-foreground">Title</h2>
  <p className="text-sm text-muted-foreground">Description</p>
</div>

// Avoid: Inline styles and non-responsive design
<div style={{ padding: '16px' }}>
  <h2 style={{ fontSize: '18px' }}>Title</h2>
</div>
```

### Dark Mode Support
```typescript
// Use CSS variables and Tailwind classes
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Button
  </button>
</div>
```

---

## Testing Strategy

### Unit Testing Setup
```bash
# Install testing dependencies
pnpm add -D @testing-library/react @testing-library/jest-dom jest
```

### Component Testing
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
```

### Store Testing
```typescript
// __tests__/stores/useItemStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useItemStore } from '@/lib/store/useItemStore';

describe('useItemStore', () => {
  beforeEach(() => {
    useItemStore.setState({ items: [], loading: false, error: null });
  });

  it('adds item correctly', () => {
    const { result } = renderHook(() => useItemStore());
    
    act(() => {
      result.current.addItem({ name: 'Test Item', status: 'active' });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Test Item');
  });
});
```

---

## Performance Optimization

### Code Splitting
```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable SSR for client-only components
});
```

### Memoization
```typescript
// React.memo for component memoization
import { memo } from 'react';

export const ExpensiveComponent = memo(function ExpensiveComponent({ 
  data 
}: { 
  data: string[] 
}) {
  // Expensive rendering logic
  return <div>{/* content */}</div>;
});

// useMemo for expensive calculations
const processedData = useMemo(() => {
  return data.filter(item => item.active).sort((a, b) => a.name.localeCompare(b.name));
}, [data]);

// useCallback for stable function references
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/assets/images/logo.svg"
  alt="Logo"
  width={100}
  height={100}
  priority // For above-the-fold images
/>
```

---

## Debugging and Development Tools

### React Developer Tools
- Install React DevTools browser extension
- Inspect component props and state
- Profile component performance

### Browser Developer Tools
```typescript
// Console debugging
console.log('Debug info:', { data, loading, error });

// Performance timing
console.time('expensive-operation');
// ... expensive operation
console.timeEnd('expensive-operation');
```

### VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**

### Debugging Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "pwa-chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## Code Quality

### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## Common Development Patterns

### Error Handling
```typescript
// Error boundary component
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <h1>Sorry.. there was an error</h1>;
    }

    return this.props.children;
  }
}
```

### Loading States
```typescript
// Loading pattern
function DataComponent() {
  const { data, loading, error } = useData();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} />;
}
```

### Form Handling
```typescript
// Form with React Hook Form and Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

This development guide provides comprehensive information for developers working on the YTFCS Healthcare Management System. Follow these patterns and guidelines to maintain code quality and consistency across the project.
