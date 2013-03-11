<?php

// Connect to database

$ajax = $_GET['ajax'];
$sql = mysql_connect("localhost","root","root");
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
	$categories = mysql_query("select distinct category from products where bar='$id'");
	$i = 0;
	echo '[';	
		while($category = mysql_fetch_row($categories)) {

			// Get sub-categories

    		$subcategories = mysql_query("select distinct sub_category,type from products where bar='$id' and category='$category[0]'");

			while($subcategory = mysql_fetch_row($subcategories)) {

    			// Get products

    			$products = mysql_query("select ID,name,description,price,sale from products where category='$category[0]' and sub_category='$subcategory[0]' and bar='$id'");

    			while($product = mysql_fetch_row($products)) {
    				$product_array = array(
    				    'id' => $product[0],
                        'name' => $product[1],
                        'description' => $product[2],
                        'price' => $product[3],
                        'salePrice' => $product[4]		
    				);
    				$product_list[] = $product_array;
    			};

				$subcategory_array = array(
				    'id' => rand(),
                    'name' => $subcategory[0],
                    'type' => $subcategory[1],
                    'products' => $product_list
				);
				unset($product_list);
				$subcategory_list[] = $subcategory_array;

            }
            
            // Get categories
            
            $i++;
            if (mysql_num_rows($subcategories)==1) {

                $products = mysql_query("select ID,name,description,price,sale from products where category='$category[0]' and bar='$id'");

    			while($product = mysql_fetch_row($products)) {
    				$product_array = array(
    				    'id' => $product[0],
                        'name' => $product[1],
                        'description' => $product[2],
                        'price' => $product[3],
                        'salePrice' => $product[4]		
    				);
    				$product_list[] = $product_array;
    			};

    			$menu = array(
    			    'id' => rand(),
    				'name' => $category[0],
    				'type' => $category[1],
    				'products' => $product_list
    			);
    			unset($product_list);

            } else {

    			$menu = array(
    			    'id' => rand(),
    				'name' => $category[0],
    				'type' => $category[1],
    				'categories' => $subcategory_list
    			);
    			unset($subcategory_list);
          
            }

			if ($i > 1) echo ',';
			echo json_encode($menu);
			
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