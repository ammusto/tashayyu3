import React from 'react';

const HomePage = () => {
  return (
    <div className='container'>
      <div className='main'>
        <div className='text-content'>
          <h2>A Corpus of Digitized Shīʿī Texts</h2>
          <p>Tashayyu3 is a searchable corpus of digitized Shīʿī texts drawn from the meta corpus consolidated by the <a href="https://openiti.org/">OpenITI team</a> and the <a href='https://kitab-project.org/'>KITAB project</a>. Although these texts have been digitzed and available online for many years, there have been no efforts to make them accessible to the non-technical user, those without the requisite coding/software development skills to access, analyze, and search these texts. Tashayyu3 is a stop-gap measure, as it is a lightweight website with limited search functions, but it is an important step in making these texts available to perform advanced searches, texts that are not represented in the most frequently used searchable corpus, al-Maktaba al-Shāmila.</p>
          <p>
            Through this website, users can browse text and author metadata, and, most importantly, search the contents of texts in the corpus. The digitized versions of these texts are available to download on the <a href='https://github.com/OpenITI'>OpenITI github</a> in the mARkdown encoding format, but I am currently in the process of cleaning and re-encoding them into TEI XML and JSON formats.</p>
          <p>To learn more about how to use this website, please go to the User Guide, linked at the top of this page</p>

        </div>
        <div className="text-content">
          <h2>Corpus Stats</h2>
          <ul className='corpus-stats'>
            <li><strong>Texts </strong>839</li>
            <li><strong>Authors </strong>435</li>
            <li><strong>Tokens </strong>135,302,103</li>
            <li><strong>Pages </strong>609,046</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;