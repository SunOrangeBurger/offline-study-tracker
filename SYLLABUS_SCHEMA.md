# Syllabus JSON Schema

## Overview
The syllabus JSON format allows you to export and share course structures with other students. Each student can import the same syllabus but track their own individual progress.

## JSON Schema

```json
{
  "name": "Tracker Name",
  "description": "Optional description",
  "color": "#3b82f6",
  "version": "1.0",
  "subjects": [
    {
      "name": "Subject Name",
      "units": [
        {
          "name": "Unit Name",
          "topics": [
            "Topic 1",
            "Topic 2",
            "Topic 3"
          ]
        }
      ]
    }
  ]
}
```

## Example: Computer Science Semester

```json
{
  "name": "Semester 4 CSE AIML",
  "description": "Computer Science and AI/ML courses for 4th semester",
  "color": "#3b82f6",
  "version": "1.0",
  "subjects": [
    {
      "name": "Design and Analysis of Algorithms",
      "units": [
        {
          "name": "Introduction and Brute Force",
          "topics": [
            "Fundamentals of Algorithmic Problem Solving",
            "Important Problem Types",
            "Analysis of Algorithm Efficiency Framework",
            "Asymptotic Notations and basic Efficiency",
            "Brute Force"
          ]
        },
        {
          "name": "Divide and Conquer",
          "topics": [
            "Merge Sort",
            "Quick Sort",
            "Binary Search",
            "Strassen's Matrix Multiplication"
          ]
        }
      ]
    },
    {
      "name": "Operating Systems",
      "units": [
        {
          "name": "Process Management",
          "topics": [
            "Process Concept",
            "Process Scheduling",
            "Inter-process Communication",
            "Threads"
          ]
        }
      ]
    }
  ]
}
```

## Features

- **Export**: Download your current tracker structure as JSON
- **Import**: Load a JSON file to create a new tracker
- **Share**: Send JSON files to classmates
- **Individual Progress**: Each student tracks their own completion status
- **Version Control**: Track syllabus versions for updates

## Usage

1. **Export Syllabus**: Click "Export Syllabus" button in tracker dashboard
2. **Share File**: Send the `.json` file to classmates
3. **Import Syllabus**: Click "Import Syllabus" when creating a new tracker
4. **Track Progress**: Each student's progress is stored separately
