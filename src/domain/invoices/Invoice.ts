type InvoiceData = {
    id: string;
    customerId: string;
    amount: number;
    date: Date;
    status: string;
};

type InvoiceMethods = {
    calculateTotal(): number;
    markAsPaid(): void;
};

type Invoice = InvoiceData & InvoiceMethods; // @AggregateRoot

export const createInvoice = (data: InvoiceData): Invoice => ({
    ...data,
    calculateTotal(): number {
        //TODO: implement this method
        return 0;
    },
    markAsPaid(): void {
        //TODO: implement this method
    },
});
