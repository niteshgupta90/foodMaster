const paginateResults = async (model, query, page, limit) => {
  const startIndex = (page - 1) * limit;
  
  const results = {};
  results.total = await model.countDocuments(query);
  results.pages = Math.ceil(results.total / limit);
  results.currentPage = page;
  results.data = await model.find(query)
    .limit(limit)
    .skip(startIndex)
    .exec();

  return results;
};

module.exports = paginateResults;