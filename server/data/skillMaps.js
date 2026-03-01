// Predefined skill maps per target role
// Used by skillGapService for rule-based gap computation (not AI-hallucinated)

const skillMaps = {
    "Software Developer": {
        core: ["Data Structures", "Algorithms", "Git", "Problem Solving"],
        frontend: ["HTML", "CSS", "JavaScript", "React"],
        backend: ["Node.js", "REST APIs", "Databases", "SQL"],
        devops: ["Docker", "CI/CD", "Linux Basics"],
        soft: ["Communication", "Code Review", "Testing"]
    },
    "Data Scientist": {
        core: ["Python", "Statistics", "Linear Algebra", "Probability"],
        ml: ["Machine Learning", "Scikit-learn", "Model Evaluation", "Feature Engineering"],
        deep_learning: ["Neural Networks", "TensorFlow/PyTorch", "NLP Basics"],
        data: ["Pandas", "NumPy", "Data Visualization", "SQL"],
        soft: ["Research Mindset", "Report Writing", "Presentation"]
    },
    "Designer": {
        core: ["Design Principles", "Color Theory", "Typography", "Grid Systems"],
        tools: ["Figma", "Adobe XD", "Photoshop", "Illustrator"],
        ux: ["User Research", "Wireframing", "Prototyping", "Usability Testing"],
        soft: ["Empathy", "Feedback Handling", "Collaboration"]
    },
    "Product Manager": {
        core: ["Product Strategy", "Roadmapping", "Prioritization", "Market Research"],
        execution: ["Agile/Scrum", "Sprint Planning", "Stakeholder Management"],
        data: ["Analytics", "A/B Testing", "User Metrics", "SQL Basics"],
        soft: ["Leadership", "Communication", "Negotiation", "Empathy"]
    },
    "Student": {
        core: ["Study Techniques", "Time Management", "Note Taking", "Critical Thinking"],
        academic: ["Research Skills", "Academic Writing", "Exam Strategies"],
        digital: ["Digital Literacy", "Productivity Tools", "Collaboration Tools"],
        soft: ["Self-Discipline", "Goal Setting", "Stress Management"]
    },
    "Researcher": {
        core: ["Research Methodology", "Literature Review", "Data Collection", "Analysis"],
        writing: ["Academic Writing", "Citation Management", "Grant Writing"],
        tools: ["Statistical Software", "Reference Management", "Data Visualization"],
        soft: ["Critical Thinking", "Attention to Detail", "Intellectual Curiosity"]
    },
    "Business Analyst": {
        core: ["Requirements Gathering", "Process Mapping", "Data Analysis", "SQL"],
        tools: ["Excel", "Power BI", "Tableau", "JIRA"],
        methodologies: ["Agile", "BPMN", "Use Case Modeling"],
        soft: ["Communication", "Problem Solving", "Stakeholder Management"]
    },
    "Entrepreneur": {
        core: ["Business Model Canvas", "Market Research", "Financial Planning", "Sales"],
        growth: ["Marketing", "SEO", "Social Media", "Growth Hacking"],
        operations: ["Team Building", "Legal Basics", "Product Development"],
        soft: ["Resilience", "Networking", "Decision Making", "Leadership"]
    }
}

export default skillMaps
