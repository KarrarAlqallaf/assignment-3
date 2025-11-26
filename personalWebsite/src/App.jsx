import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Circle from './Circle'
import Row from './Row'
import Column from './Column'
import './App.css'
import ProjectContainer from './projContainer'
import GitHubRepos from './GitHubRepos'
import Countdown from './Countdown'

const App = () => {
  const [activeTab, setActiveTab] = useState('projects')
  
  // Initialize language from localStorage, default to 'Eng' if not found
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage')
    return savedLanguage || 'Eng'
  })

  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  // State for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleTabClick = (tab) => {
    setActiveTab(tab)
  } 
  
  const toggleLanguage = () => {
    setLanguage(prevLanguage => (prevLanguage === 'Eng' ? 'Arb' : 'Eng'));
  };

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language)
  }, [language])

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle form submission
  const handleSubmit = () => {
    // Check if email is valid
    if (!isValidEmail(formData.email)) {
      alert(language === 'Eng' 
        ? 'Please enter a valid email address' 
        : 'الرجاء إدخال عنوان بريد إلكتروني صحيح')
      return
    }

    // Check if all fields are filled
    if (!formData.name || !formData.email || !formData.message) {
      alert(language === 'Eng' 
        ? 'Please fill in all fields' 
        : 'الرجاء ملء جميع الحقول')
      return
    }

    // Clear the form
    setFormData({
      name: '',
      email: '',
      message: ''
    })

    // Show success message
    setShowSuccessMessage(true)

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }

  // Helper object for simple content translation
  const text = {
    headerTitle: language === 'Eng' ? 'Karrar Alqallaf' : 'كرار القلاف',
    headerDescription: language === 'Eng' 
      ? 'King Fahd University of Petroleum and Minerals computer science student. Saudi born at 2004 in Qatif.'
      : 'طالب علوم حاسب بجامعة الملك فهد للبترول والمعادن. سعودي مواليد 2004 في القطيف.',
    projectsTab: language === 'Eng' ? 'Projects' : 'المشاريع',
    skillsTab: language === 'Eng' ? 'Skills' : 'المهارات',
    hobbiesTab: language === 'Eng' ? 'Hobbies' : 'الهوايات',
    skillsContent: language === 'Eng' ? 'Figma, Python, Java, React & more' : 'فيجما، بايثون، جافا، رياكت والمزيد',
    hobbiesContent: language === 'Eng' ? 'Motor Sport, Gaming & Fitness' : ' السيارات، الألعاب الرقمية و كمال الأجسام',
    contactTitle: language === 'Eng' ? 'Contact Me' : 'تواصل معي',
    namePlaceholder: language === 'Eng' ? 'Your Name' : 'اسمك',
    emailPlaceholder: language === 'Eng' ? 'Your Email' : 'بريدك الإلكتروني',
    messagePlaceholder: language === 'Eng' ? 'your message' : 'رسالتك',
    submitButton: language === 'Eng' ? 'Submit' : 'إرسال',
    successMessage: language === 'Eng' ? 'Message sent successfully!' : 'تم إرسال الرسالة بنجاح!',
  } 

  return (
    // Set text direction based on language
    <div className = "appContainer" dir={language === 'Arb' ? 'rtl' : 'ltr'}> 
      
      {/* header section */}
      <Row justify="flex-start" padding="50px 0 0 0" dir="ltr"> 
      <button
      className={`languageBTN ${language === 'Eng' ? 'EngActive' : 'ArbActive'}`}
        onClick={toggleLanguage}
      >
        {/* Button displays the language it switches *to* */}
        {language === 'Eng' ? 'عربي' : 'Engl'}
      </button>
      </Row>

     
     

      {/* --- Header Content Translation --- */}
      <Row>
        <Column>
          <h1 className='header-title'>
            {text.headerTitle}
          </h1>
            <p className='header-description'>
        
            {text.headerDescription}
            </p>
        </Column>
        <Circle 
          imageSrc="/src/assets/Images/My circle image.png" 
          alt="Karrar Alqallaf profile picture"
        />
      </Row>

      <Countdown language={language} />
      
      {/* info section (Tabs) */}
      <Row>
        {/* --- Tabs Translation --- */}
        <button 
          className={`infoBTNs ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => handleTabClick('projects')}
        >
          {text.projectsTab}
        </button>
        <button 
          className={`infoBTNs ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => handleTabClick('skills')}
        >
          {text.skillsTab}
        </button>
        <button 
          className={`infoBTNs ${activeTab === 'hobbies' ? 'active' : ''}`}
          onClick={() => handleTabClick('hobbies')}
        >
          {text.hobbiesTab}
        </button>
      </Row>

      {/* Content sections - only show active tab */}
      {/* (ProjectContainer titles should be updated inside ProjectContainer component 
          if it needs to be multilingual) */}
      {activeTab === 'projects' && (
        <>
          <GitHubRepos language={language} />
        </>
      )}

      {activeTab === 'skills' && (
        <Row>
          {/* --- Skills Content Translation --- */}
          <p className='shP'>{text.skillsContent}</p>
        </Row>
      )}

      {activeTab === 'hobbies' && (
        <Row>
          {/* --- Hobbies Content Translation --- */}
          <p className='shP'>{text.hobbiesContent}</p>
        </Row>
      )}

      {/* contact me section */}
      <Row padding = "15px 0" align="flex-end" gap='25px'>
        {/* --- Contact Title Translation --- */}
        <h2 className = 'contact'>{text.contactTitle}</h2>
        <p className='email'>s202267840@kfupm.edu.sa</p>
      </Row>
       <Row gap='25px' padding = "15px 0">   
        {/* --- Contact Form Placeholder Translation --- */}
        <textarea 
          placeholder={text.namePlaceholder} 
          id="name"
          value={formData.name}
          onChange={handleInputChange}
        ></textarea>
        <textarea 
          placeholder={text.emailPlaceholder} 
          id="email"
          value={formData.email}
          onChange={handleInputChange}
        ></textarea>
         </Row>
        <Row padding = "15px 0">
        <textarea 
          placeholder={text.messagePlaceholder} 
          id="message" 
          style={{width: "941px", height: "268px"}}
          value={formData.message}
          onChange={handleInputChange}
        ></textarea>
        </Row>

      {/* Success Message */}
      {showSuccessMessage && (
        <Row padding="15px 0">
          <p className='success-message'>{text.successMessage}</p>
        </Row>
      )}

      <button className='infoBTNs' onClick={handleSubmit}>{text.submitButton}</button>
      
    </div>
  )
}

export default App