<?php

// Connect to database

$ajax = $_GET['ajax'];
$sql = mysql_connect("localhost","kaleazy","password");
$db = mysql_select_db("flowtab_test",$sql);
if (!$sql) {
	die('Could not connect: ' . mysql_error());
}

// Call venues

function get_venues() {
	$result = mysql_query("select ID,first_name,nickname,address_num,address_street,address_city,address_hood,address_state,address_zip from users where bar=1");
	echo '[';
		$i = 0;
		while($row = mysql_fetch_row($result)) {
			$i = $i + 1;
			$venue = array(
				'id' => $row[0],
				'first' => $row[1],
				'short' => $row[2],
				'address' => $row[3],
				'street' => $row[4],
				'city' => $row[5],
				'hood' => $row[6],
				'state' => $row[7],
				'zip' => $row[8]		
			);
			if ($i > 1) echo ',';
			echo json_encode($venue);
		}
	echo ']';
	die();
};

// Call menus

function get_menus() {
	$id = $_GET['id'];
	$categories = mysql_query("select distinct type, category, sub_category from products where bar='$id'");
	$i = 0;
	echo '[';	
		while($category = mysql_fetch_row($categories)) {
			$products = mysql_query("select ID,name,description,price,sale from products where type='$category[0]' and bar='$id'");

			// Get products

			while($prod = mysql_fetch_row($products)) {
				$product = array(
                    'id' => $prod[0],
                    'name' => $prod[1],
                    'description' => $prod[2],
                    'price' => $prod[3],
                    'salePrice' => $prod[4]			
				);
				$product_list[] = $product;
			};
	
			// Get categories
			
			$i++;
			$menu = array(
				'bar' => $id,
				'category' => $category[1],
				'subCategory' => $category[2],
				'type' => $category[0],
				'products' => $product_list
			);
			if ($i > 1) echo ',';
			echo json_encode($menu);
			unset($product_list);
			
		}
	echo ']';
	die();
};

// Call functions

if ($ajax == 'venues') get_venues();
if ($ajax == 'menus') get_menus();

// Close database connection

mysql_close($sql);

?>