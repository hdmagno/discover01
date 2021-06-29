const Modal = {
    open() {
        document
        .querySelector('.modal-overlay')
        .classList.add('active');
    },
    close() {
        document
        .querySelector('.modal-overlay')
        .classList.remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
    },

    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions));
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);
        
        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        });
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        });
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {    
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHtmlTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);
    },

    innerHtmlTransaction(transaction, index) {
        const CssClass = transaction.amount > 0 ? 'income' : 'expense';

        const amount = Util.formatCurrency(transaction.amount);

        const html = 
        `
        <td class="description">${transaction.description}</td>
        <td class=${CssClass}>${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remover transação">
        </td>
        `

        return html;
    },

    updateBalance() {
       document.getElementById('incomeDisplay')
       .innerHTML = Util.formatCurrency(Transaction.incomes());

       document.getElementById('expenseDisplay')
       .innerHTML = Util.formatCurrency(Transaction.expenses());

       document.getElementById('totalDisplay')
       .innerHTML = Util.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = '';
    }
}

const Util = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : '';

        value = String(value).replace(/\D/g, '');

        value = Number(value) / 100;

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        return signal + value;
    },

    formatAmount(value) {
        value = String(value).replace(/\,\./g, '');
        value = Number(value) * 100;
        return value;
    },

    formatDate(date) {
        const splitDate = date.split('-');
        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    formatValues() {
        // let description = Form.getValues().description;
        // let amount = Form.getValues().amount;
        // let date = Form.getValues().date;

        let {description, amount, date} = Form.getValues();

        amount = Util.formatAmount(amount);

        date = Util.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    validateFields() {
        const {description, amount, date} = Form.getValues();
        
        if(description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Preencha todos os campos.');
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = '',
        Form.amount.value = '',
        Form.date.value = ''
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Form.saveTransaction(transaction);
            Form.clearFields();
            Modal.close();
        } 
        catch (error) {
            alert(error.message);
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);
        
        DOM.updateBalance();

        Storage.set(Transaction.all);        
    },

    reload() {
        DOM.clearTransactions();
        App.init();
    }
}

App.init();



