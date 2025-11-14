Dipstik is a web based platform that provides users with used card negotiation leverage techniques.
The main functionality is to build an upcoming service summary including routine and typical unscheduled items, cost, likelihood, background info.
The two main features to do this are:
1. Immediately due work package based on comparing the service history records to a recommended routine maintenance schedule.
2. Unscheduled maintenance forecast report based on service history records, mileage and tpyical unscheduled maintenance drivers.
The app shall implement capability for users to input make, model, year, mileage and service history records (as a pdf document) and recieve these two reports. The reports shall include:
1. A table showing all routine maintenance items, the mileage or time intervals that experts of that car manufacturer (indie type mechanics) recommend, cost range, OEM service center cost, and where the current service history lies in relation to the recommended schedule. If an item is past due, add a note detailing the risk and a severity of that risk due to being overdue on it.
2. A table showing all typical unscheduled maintenance items, the mileage or time forecast for when that item fails, likelihood of failure, cost range, OEM service center cost, if it has already failed and/or been replaced and how many miles its been since that maintenance was completed. One last column with a narrative detailing the possibility of it happening soon based on if its already happened/been replaced the help users fully understand.
3. One final report explaining the overall condition of the car, potential upcoming items and total upcoming cost. Separate upcoming items into three categories, immediately due or likely to occur, within the next 10000 miles and a 3-5 year forecast.
Now I want you to build the codebase for a prototype that has this functionality.
Lets walk through a development plan of the prototype. Start with a high level architecture and then buuild it piece by piece.






