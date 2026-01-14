# Group Chat User Flows

## Group Creation Flow
```mermaid
graph TD
    A[User clicks 'New Group'] --> B[Multi-select users modal opens]
    B --> C[User selects 2+ users]
    C --> D[User enters group name]
    D --> E[Group created with creator as admin]
    E --> F[All selected users added to group]
    F --> G[Chat opens for all participants]
```

## Group Management Flow
```mermaid
graph TD
    A[Admin opens group info] --> B{User is admin?}
    B -->|Yes| C[Show admin controls]
    B -->|No| D[Show member view only]

    C --> E[Can add members]
    C --> F[Can remove members]
    C --> G[Can promote/demote admins]
    C --> H[Can change group name]

    D --> I[Can view members]
    D --> J[Can leave group]
```

## Permission Check Flow
```mermaid
graph TD
    A[User attempts action] --> B{Action requires admin?}
    B -->|No| C[Allow action]
    B -->|Yes| D{User is admin?}
    D -->|Yes| E[Allow action]
    D -->|No| F[Deny action with message]
```

## Member Addition Flow
```mermaid
graph TD
    A[Admin clicks 'Add Member'] --> B[User selection modal opens]
    B --> C[Admin selects users]
    C --> D[Check if users already in group]
    D -->|Not in group| E[Add users to participants array]
    D -->|Already in group| F[Show warning, skip]
    E --> G[Update group in database]
    G --> H[Send notification to new members]
```

## Member Removal Flow
```mermaid
graph TD
    A[Admin selects member to remove] --> B{Target is admin?}
    B -->|Yes| C{Only admin?}
    C -->|Yes| D[Cannot remove - show error]
    C -->|No| E[Allow removal]
    B -->|No| E

    E --> F{Target is self?}
    F -->|Yes| G[Confirm leaving group]
    F -->|No| H[Confirm removing member]

    G --> I[Remove from group]
    H --> I
    I --> J[Update database]
    J --> K[Notify remaining members]