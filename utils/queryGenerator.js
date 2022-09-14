const mongoose = require('mongoose')
const statsQueryGenerator = (entityIdKey, entityIdValue, datesQuery) => {

    const { from, to, until, specific } = datesQuery

        
        let searchQuery = {}
        searchQuery[entityIdKey] = mongoose.Types.ObjectId(entityIdValue) 

        let toDate = new Date()
        let fromDate = new Date()

        if(until) {

            toDate = new Date(until)

            const dateQuery = { $lte: toDate }
            searchQuery = { ...searchQuery, createdAt: dateQuery }


        } else if(from && to) {

            fromDate = new Date(from)
            toDate = new Date(to)

            const dateQuery = { $gte: fromDate, $lte: toDate }
            searchQuery = { ...searchQuery, createdAt: dateQuery }

        } else if(specific) {

            let fromDateTemp = new Date(specific)
            toDate = new Date(fromDateTemp.setDate(fromDateTemp.getDate() + 1))
            fromDate = new Date(specific)

            const dateQuery = { $gte: fromDate, $lte: toDate }
            searchQuery = { ...searchQuery, createdAt: dateQuery }
        }

        return { searchQuery, fromDate, toDate }
    
}

module.exports = { statsQueryGenerator }