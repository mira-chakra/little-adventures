# Rough wireframes (Milestone 1 artifact)

Wireframes describe **layout**, not finalized screenshots.

## Homepage
```text
┌─────────────────────────────────────────────────────────────────┐
│ ✳ littleadventures.   Home  Explore  Pick for me  Favorites/Login │
├─────────────────────────────────────────────────────────────────┤
│  YOUR NEXT MEMORY…                          ┌───────────────┐   │
│  Small plans.                               │ mountain art  │   │
│  Big memories.                              │ sun + hills   │   │
│  Description + 2 call-to-action buttons     └───────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  LESS SCROLLING           [Mood] [Schedule] [Favorites]          │
└─────────────────────────────────────────────────────────────────┘
```

## Explore
```text
Title: Explore adventures
[Search………………] [Region ▼] [Mood ▼] [Budget ▼] [Apply]
[X adventures]
[Adventure picture] [Adventure picture] [Adventure picture]
[Title / moods   ] [Title / moods   ] [Title / moods   ]
[Cost + duration ] [Cost + duration ] [Cost + duration ]
```

## Pick for Me
```text
[ Mood ▼ ]           │ Suggested matches appear here
[ Budget $ ]         │ [Score + adventure card]
[ Time ▼ ]           │ [Score + adventure card]
[ Region ▼ optional] │
[ Find my adventures ]
```

## Admin
```text
Title: Adventure management              [+ Add adventure]
[Adventures]  [Accounts]  [Favorites]
Adventure A · location / cost             [Edit] [Delete]
Adventure B · location / cost             [Edit] [Delete]

Add/edit: Title | Description | Region | Location
          Cost | Duration | Mood checkboxes | Cover | Tips
          [Save adventure]
```

### Responsive approach

Desktop uses multi-column layout. On small screens navigation becomes a menu, Explore cards become single column, and form columns stack. The actual responsive CSS is in `client/src/styles.css`.
