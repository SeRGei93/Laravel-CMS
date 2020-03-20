<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFactorProductTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('factor_product', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('price')->unsigned();
            $table->integer('count')->unsigned();
            $table->integer('discount_price')->unsigned()->nullable();
            $table->unsignedBigInteger('factor_id')->nullable();
            $table->foreign('factor_id')->references('id')->on('factors');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->foreign('product_id')->references('id')->on('products');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('factor_product');
    }
}
