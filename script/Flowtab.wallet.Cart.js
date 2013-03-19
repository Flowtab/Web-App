Flowtab.wallet.Cart = function Flowtab_wallet_Cart(products) {
    this.products = products;
    this.items = {};
    $checkoutButton = $('#checkout-button');
};

Flowtab.wallet.Cart.prototype = {
    constructor: Flowtab.wallet.Cart

  , getCount: function Flowtab_wallet_Cart_prototype_getCount() {
        var value = 0;

        for (var k in this.items)
            value += this.items[k].count;

        return value;
    }

  , getTotal: function Flowtab_wallet_Cart_prototype_getTotal() {
        var value = 0;

        for (var k in this.items)
            value += this.products[k].price;

        return value;
    }

  , getItemCount: function Flowtab_wallet_Cart_prototype_getItemCount(uuid) {
        if (uuid in this.products)
            return uuid in this.items
                ? this.items[uuid].count
                : 0;

        //TODO: handle error
    }

  , addItem: function Flowtab_wallet_Cart_prototype_addItem(uuid, count) {

        $($checkoutButton).addClass("visible");

        if (!count)
            count = 1;

        if (uuid in this.products)
            return uuid in this.items
                ? this.items[uuid].count += count
                : (this.items[uuid] = { count: count }).count;
                
        //TODO: handle error
    }

  , subtractItem: function Flowtab_wallet_Cart_prototype_subtractItem(uuid, count) {

        var item;

        if (uuid in this.items) {
            if (!count)
                count = 1;

            item = this.items[uuid];

            if (item.count > count)
                return this.items[uuid].count -= count;

            $($checkoutButton).removeClass("visible");
            delete this.items[uuid];
            return 0;
        }

        //TODO: handle error
    }

  , emptyCart: function Flowtab_wallet_Cart_prototype_emptyCart() {
        for (var k in this.items)
            delete this.items[k];
    }

  , addItemMetadata: function Flowtab_wallet_Cart_prototype_addItemMetadata(uuid, metadata) {
        if (uuid in this.products) {
            var item = this.items[uuid];

            if (item && item.count < item.metadata.length)
                return item.metadata.push(metadata) - 1;
        }

        //TODO: handle error
    }

  , serialize: function Flowtab_wallet_Cart_prototype_serialize() {
        return JSON.stringify(this.items);
    }
};