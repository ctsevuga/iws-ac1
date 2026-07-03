import React from "react";
import { Pagination } from "react-bootstrap";

const Paginate = ({
  pages,
  page,
  onPageChange,
}) => {
  // Don't show pagination if only one page
  if (!pages || pages <= 1) {
    return null;
  }

  return (
    <Pagination className="justify-content-center">

      {/* PREVIOUS */}
      <Pagination.Prev
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      />

      {/* PAGE NUMBERS */}
      {[...Array(pages).keys()].map((x) => (
        <Pagination.Item
          key={x + 1}
          active={x + 1 === page}
          onClick={() => onPageChange(x + 1)}
        >
          {x + 1}
        </Pagination.Item>
      ))}

      {/* NEXT */}
      <Pagination.Next
        disabled={page === pages}
        onClick={() => onPageChange(page + 1)}
      />

    </Pagination>
  );
};

export default Paginate;