exports.getPagination = (page, limit) => {
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  return {
    page: pageNumber,
    limit: limitNumber,
    skip
  };
};

exports.getPaginationData = (total, page, limit) => {
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;
  const totalPages = Math.ceil(total / limitNumber);

  return {
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages,
    hasNextPage: pageNumber < totalPages,
    hasPrevPage: pageNumber > 1
  };
};
