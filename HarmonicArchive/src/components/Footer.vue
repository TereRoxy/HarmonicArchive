<template>
    <footer class="footer">
      <p>© {{ currentYear }} Harmonic Archive. All rights reserved. | </p>
      <p>
         Contact me: 
        <a href="mailto:terebent.roxana@gmail.com"> terebent.roxana@gmail.com | </a>
      </p>
      <p>
        Designed and developed by <strong> Tere Roxy </strong>.
      </p>
    </footer>
  </template>
  
  <script>
  export default {
    name: "Footer",
    data() {
      return {
        currentYear: new Date().getFullYear(),
      };
    },
  };
  </script>
  
  <style scoped>
  .footer {
    background-color: #532b88;
    color: #f4effa;
    text-align: center;
    padding: 10px 10px;
    position: relative;
    bottom: 0;
    font-size: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  
  .footer a {
    color: #f4effa;
    text-decoration: underline;
  }
  
  .footer a:hover {
    color: #d1c4e9;
  }
  
  .footer p {
    margin: 5px 0;
  }
  </style>