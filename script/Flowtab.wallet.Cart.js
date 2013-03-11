Flowtab.wallet.Cart = function Flowtab_wallet_Cart(products) {
    this.products = products;
    this.items = [];
}

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

  , getItemCount: function Flowtab_wallet_Cart_prototype_getItemCount() {
        if (uuid in this.products)
            return return uuid in cart
                ? cart[uuid].count
                : 0;

        //TODO: handle error
    }

  , addItem: function Flowtab_wallet_Cart_prototype_addItem(uuid, count) {
        if (uuid in this.products)
            return uuid in cart
                ? cart[uuid].count += count || 1
                : (cart[uuid] = { count: count }).count;
        
        //TODO: handle error
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
        //TODO
    }
};