 function generateRoleId(role){ 
    const validRoles = ["MEM","DIV", "DIST", "STAT", "BM"]; 
    if (!validRoles.includes(role)) { 
        console.log("Invalid role type for roleId")
      throw new Error("Invalid role type for roleId generation"); 
    } 
    const timestamp = Date.now(); // Returns the number of milliseconds since the UNIX epoch. [3, 7, 8] 
    // const randomDigits = Math.floor(100 + Math.random() * 900); // Generates a 3-digit number. [1, 2, 4] 
    console.log(`${role}${timestamp}`)
    return `${role}${timestamp}`; 
  };
  export default generateRoleId 