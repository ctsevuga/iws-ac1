import React, { useState } from "react";

import {
  Container,
  Card,
  Button,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";

import AsyncSelect from "react-select/async";

import { toast } from "react-toastify";

import { useLazySearchCompaniesQuery } from "../../slices/companyApiSlice";

import { useGenerateInvoiceMutation } from "../../slices/billingApiSlice";

const GenerateInvoiceScreen = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [searchCompanies] = useLazySearchCompaniesQuery();

  const [generateInvoice, { isLoading }] =
    useGenerateInvoiceMutation();


  /* -------------------------------------------------------------------------- */
  /*                         COMPANY SEARCH HANDLER                             */
  /* -------------------------------------------------------------------------- */

  const loadCompanyOptions = async (inputValue) => {
  try {
    const response = await searchCompanies({
      search: inputValue,
      page: 1,
      limit: 20,
    }).unwrap();

    return response.companies.map((company) => ({
      value: company._id,
      label: company.legalName
        ? `${company.name} (${company.legalName})`
        : company.name,
    }));

  } catch (error) {
    return [];
  }
};


  /* -------------------------------------------------------------------------- */
  /*                         GENERATE HANDLER                                  */
  /* -------------------------------------------------------------------------- */

  const generateHandler = async () => {
  if (!selectedCompany) {
    toast.error("Please select a company");
    return;
  }

  const payload = {
    companyId: selectedCompany.value,
  };

  console.log("Payload before API call:", payload);

  try {
    await generateInvoice(payload).unwrap();

    toast.success("Invoice generated successfully");

  } catch (error) {
    toast.error(
      error?.data?.message || "Unable to generate invoice"
    );
  }
};


  return (
    <Container className="py-4">

      <Row>
        <Col md={8} className="mx-auto">

          <Card className="shadow-sm border-0">

            <Card.Body>

              <h3 className="fw-bold text-primary mb-4">
                Generate Invoice
              </h3>


              <Form.Group className="mb-4">

                <Form.Label>
                  Select Company
                </Form.Label>


                <AsyncSelect
  cacheOptions
  defaultOptions
  loadOptions={loadCompanyOptions}
  value={selectedCompany}
  placeholder="Search company..."
  noOptionsMessage={() => "No companies found"}
  loadingMessage={() => "Searching companies..."}
  onChange={setSelectedCompany}
/>

              </Form.Group>


              <Button
                variant="primary"
                disabled={isLoading || !selectedCompany}
                onClick={generateHandler}
              >

                {isLoading ? (
                  <>
                    <Spinner
                      size="sm"
                      className="me-2"
                    />
                    Generating...
                  </>
                ) : (
                  "Generate Invoice"
                )}

              </Button>


            </Card.Body>

          </Card>

        </Col>
      </Row>

    </Container>
  );
};


export default GenerateInvoiceScreen;