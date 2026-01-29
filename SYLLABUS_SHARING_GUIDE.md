# Syllabus Sharing Feature Guide

## Overview
StudyApp now supports exporting and importing syllabus structures as JSON files. This allows students to share course structures while maintaining individual progress tracking.

## Features

### 1. Export Syllabus
- Export your tracker's structure (subjects, units, topics) as a JSON file
- Includes tracker name, description, and color
- Does NOT include your personal progress data
- Creates a shareable template

### 2. Import Syllabus
- Import a JSON file to create a new tracker
- Automatically creates all subjects, units, and topics
- Starts with 0% progress (fresh tracking)
- Maintains the original structure

## How to Use

### Exporting a Syllabus

1. Open any tracker in your dashboard
2. Click the **"Export Syllabus"** button (top right, next to tracker name)
3. A JSON file will be downloaded: `TrackerName_syllabus.json`
4. Share this file with classmates via email, messaging, or cloud storage

### Importing a Syllabus

1. Go to the tracker list for any semester
2. Click the **"Import Syllabus"** button (next to "Create New Tracker")
3. Select the JSON file you received
4. A new tracker will be created with the imported structure
5. Start tracking your own progress!

## JSON File Format

```json
{
  "name": "Semester 4 CSE AIML",
  "description": "Computer Science courses",
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
            "Brute Force Algorithms"
          ]
        }
      ]
    }
  ]
}
```

## Use Cases

### 1. Class Collaboration
- One student creates the syllabus structure
- Exports and shares with the entire class
- Everyone imports and tracks their own progress

### 2. Multiple Semesters
- Export a syllabus from a previous semester
- Import it for the current semester
- Reuse the same structure with fresh progress

### 3. Study Groups
- Share syllabus templates within study groups
- Everyone uses the same structure
- Compare progress without sharing personal data

### 4. Course Templates
- Create template syllabi for common courses
- Build a library of course structures
- Quick setup for new students

## Privacy & Data

### What's Included in Export:
- ✅ Tracker name
- ✅ Description
- ✅ Color theme
- ✅ Subject names
- ✅ Unit names
- ✅ Topic names
- ✅ Structure and organization

### What's NOT Included:
- ❌ Your completion status
- ❌ Checked/unchecked topics
- ❌ Test schedules
- ❌ Personal notes
- ❌ Progress percentages
- ❌ Timestamps

## Tips

1. **Descriptive Names**: Use clear tracker names for easy identification
2. **Add Descriptions**: Include course codes or semester info in descriptions
3. **Color Coding**: Use consistent colors for similar subjects
4. **Version Control**: Keep track of syllabus versions if courses change
5. **Backup**: Export your syllabi as backups before major changes

## Technical Details

- **File Format**: JSON (JavaScript Object Notation)
- **File Extension**: `.json`
- **Encoding**: UTF-8
- **Size**: Typically 1-10 KB depending on syllabus complexity
- **Compatibility**: Works across all StudyApp installations

## Troubleshooting

**Import fails with "Invalid JSON":**
- Ensure the file hasn't been corrupted
- Check that it's a valid JSON file
- Try re-downloading the original file

**Missing subjects after import:**
- Verify the JSON structure matches the schema
- Check for any syntax errors in the file

**Can't find export button:**
- Make sure you're in the tracker dashboard (not tracker list)
- Look for the "Export Syllabus" button next to the tracker name

## Example Workflow

1. **Student A** creates a comprehensive tracker for "Semester 4"
2. **Student A** exports the syllabus as `Semester4_syllabus.json`
3. **Student A** shares the file in the class group chat
4. **Students B, C, D** download the file
5. Each student imports it into their own StudyApp
6. Everyone now has the same structure but tracks individually
7. Students can compare progress without sharing personal data

Enjoy collaborative studying with StudyApp! 🎓
