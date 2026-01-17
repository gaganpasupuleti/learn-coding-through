# Planning Guide

A browser-based coding sandbox where students can learn SQL, Python, and Java by completing hands-on projects with instant feedback and syntax validation.

**Experience Qualities**:
1. **Empowering** - Students feel capable and in control as they write real code and see immediate results
2. **Exploratory** - The sandbox encourages experimentation without fear of breaking things
3. **Progressive** - Clear learning paths guide students from basic to advanced concepts

**Complexity Level**: Light Application (multiple features with basic state)
- Features include code editing, project selection, language switching, and validation/execution feedback, but doesn't require complex backend systems or multi-view navigation

## Essential Features

### Language Selection
- **Functionality**: Toggle between SQL, Python, and Java languages
- **Purpose**: Allows students to focus on their chosen language or explore multiple languages
- **Trigger**: Clicking language tabs on the home page
- **Progression**: Home page → Language tab clicked → Projects filtered by language → Display 2 projects per language
- **Success criteria**: Projects display correctly for selected language, visual feedback shows active language

### Project Selection
- **Functionality**: Choose from 2 projects per language (6 total projects)
- **Purpose**: Provides structured learning paths with varying difficulty
- **Trigger**: Clicking a project card
- **Progression**: View project list → Click project card → Navigate to code editor → Display project description and starter code
- **Success criteria**: Correct project loads with appropriate starter code and instructions

### Code Editor
- **Functionality**: Write and edit code with colorful syntax highlighting
- **Purpose**: Core learning interface where students practice coding with visual feedback
- **Trigger**: Project selected
- **Progression**: Project loads → Editor displays starter code → Student types code → Real-time syntax highlighting with colorful tokens for keywords, functions, strings, numbers, operators, comments
- **Success criteria**: Code editing feels smooth, syntax highlighting works in real-time with distinct colors for different code elements, code persists between sessions

### Code Execution & Validation
- **Functionality**: Run code and see results or errors
- **Purpose**: Immediate feedback helps students learn from mistakes
- **Trigger**: Clicking "Run Code" button
- **Progression**: Click run → Code validates → Display output/results or errors → Student iterates
- **Success criteria**: Clear success/error messages, simulated execution results display correctly

### Progress Tracking
- **Functionality**: Track which projects have been completed
- **Purpose**: Motivates students and shows learning progress
- **Trigger**: Successfully completing a project
- **Progression**: Complete project → Mark as complete → Visual indicator on project card → Count updates
- **Success criteria**: Completion status persists, visual badges/checkmarks appear

## Edge Case Handling

- **Empty Code Submission** - Display friendly message asking student to write code first
- **Syntax Errors** - Highlight the problematic line and provide helpful error messages
- **Browser Refresh** - Persist code and progress using useKV to prevent work loss
- **No Project Selected** - Show welcome message with instructions to select a project
- **Rapid Language Switching** - Debounce to prevent UI flashing

## Design Direction

The design should evoke a **modern developer workspace** that feels professional yet approachable for students. Think terminal aesthetics meets friendly learning platform - clean monospace fonts, subtle tech-inspired patterns, and a color palette that suggests both coding sophistication and educational warmth.

## Color Selection

A tech-forward palette combining deep coding-inspired backgrounds with vibrant accent colors for each language.

- **Primary Color**: Deep Indigo `oklch(0.35 0.08 265)` - Represents professionalism and focus, reminiscent of IDE themes
- **Secondary Colors**: 
  - SQL Blue `oklch(0.65 0.15 230)` - Cool, database-like precision
  - Python Green `oklch(0.70 0.12 150)` - Natural, growth-oriented learning
  - Java Orange `oklch(0.68 0.15 45)` - Energetic, powerful execution
- **Accent Color**: Electric Cyan `oklch(0.75 0.18 195)` - Attention-grabbing for CTAs, success states, and interactive elements
- **Foreground/Background Pairings**:
  - Background (Dark Navy `oklch(0.18 0.04 265)`): Light text `oklch(0.95 0.01 265)` - Ratio 11.2:1 ✓
  - Primary (Deep Indigo `oklch(0.35 0.08 265)`): White text `oklch(0.98 0 0)` - Ratio 7.8:1 ✓
  - Accent (Electric Cyan `oklch(0.75 0.18 195)`): Dark text `oklch(0.18 0.04 265)` - Ratio 8.5:1 ✓
  - SQL Blue `oklch(0.65 0.15 230)`: Dark text `oklch(0.18 0.04 265)` - Ratio 6.2:1 ✓

## Font Selection

Typography should blend technical precision with educational clarity - monospace for code, clean sans-serif for UI.

- **Typographic Hierarchy**:
  - H1 (Page Title): Space Grotesk Bold / 36px / tight letter spacing - Technical yet friendly
  - H2 (Project Titles): Space Grotesk Semibold / 24px / normal spacing
  - H3 (Section Headers): Space Grotesk Medium / 18px / normal spacing
  - Body Text: Inter Regular / 16px / line-height 1.6 - Maximum readability
  - Code Editor: JetBrains Mono Regular / 14px / line-height 1.5 - Professional code display
  - Button Labels: Inter Semibold / 14px / uppercase / tracking-wide

## Animations

Animations should reinforce the technical nature while maintaining smoothness - code-like transitions with purposeful motion.

- **Language Tab Switching**: Slide indicator with 200ms ease for smooth transitions
- **Project Card Hover**: Subtle lift (4px) with 150ms ease and shadow expansion
- **Code Execution**: Pulsing button → Brief loading state → Results fade in (300ms)
- **Success Completion**: Checkmark scale-in with bounce effect (400ms spring animation)
- **Editor Focus**: Soft glow transition on the editor border (200ms)

## Component Selection

- **Components**:
  - `Tabs` - Language selection (SQL/Python/Java) with custom styling
  - `Card` - Project cards with hover states, gradient borders for language identification
  - `Button` - Run code, navigation, project selection with loading states
  - `Badge` - Difficulty levels (Beginner/Intermediate) and completion status
  - `Textarea` - Code editor area (will be customized with monospace styling)
  - `ScrollArea` - Project list and code output display
  - `Separator` - Divide editor from output
  - `Alert` - Error messages and validation feedback
  
- **Customizations**:
  - Custom code editor with Prism.js syntax highlighting featuring language-specific tokenization
  - Colorful syntax highlighting with distinct colors for keywords, functions, strings, numbers, operators, and comments
  - Overlay technique for transparent textarea with colored syntax highlighting behind it
  - Language-specific accent colors on project cards (border gradients)
  - Animated progress indicator for completed projects
  - Custom terminal-style output display for code results
  
- **States**:
  - Buttons: Default (primary/secondary colors), Hover (brightness +10%), Active (scale 0.98), Loading (spinner icon), Disabled (opacity 50%)
  - Tabs: Active (underline + accent color), Inactive (muted), Hover (slight accent tint)
  - Cards: Default (subtle border), Hover (elevated shadow + scale 1.02), Selected (accent border)
  - Editor: Default (border), Focus (accent glow), Error (destructive border pulse)
  
- **Icon Selection**:
  - `Code` - Editor/sandbox indicator
  - `Play` - Run code button
  - `Check` - Completed projects
  - `FileCode` - Project cards
  - `Lightning` - Quick start actions
  - `ArrowLeft` - Back navigation
  - `Terminal` - Output display
  
- **Spacing**:
  - Page padding: `p-6` (24px) on mobile, `p-8` (32px) on desktop
  - Card gaps: `gap-6` (24px) in grid layouts
  - Section spacing: `space-y-8` (32px) between major sections
  - Component internal padding: `p-4` (16px) for cards, `p-6` (24px) for editor areas
  - Button padding: `px-6 py-3` (24px horizontal, 12px vertical)
  
- **Mobile**:
  - Language tabs: Scrollable horizontal tabs with snap points
  - Project grid: Single column stack on mobile, 2 columns on tablet, 3 columns on desktop
  - Editor: Full-width with fixed bottom toolbar for run button
  - Output: Collapsible drawer that slides up from bottom on mobile
  - Navigation: Sticky header with hamburger menu for additional options
