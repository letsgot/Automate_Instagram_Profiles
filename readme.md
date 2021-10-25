- it just need the multiple profile name that you want to automate

* it works on multiple profile of instagram simutaneously using puppeteer
* Advantage to automate 

1. it login your instagram profile as per you given the crediential
2. it does a multiple searches of profile as per input 
3. for each profile does it does these works

  * it follows the person (if you already followed him/her then for this there is also a check condition).
  * it fetches recent 12 post of that profile(if 12 post are not there in profile it fetches all post of that profile).
  * it fetches the data(His/Her id ,Number of follower, Number of following , No of post,description of profile) maintain a excel sheet for storing this data.

-- Module Used
* Puppeteer
* Minimist
* Xlsx
* fs

--Language
* Javascript