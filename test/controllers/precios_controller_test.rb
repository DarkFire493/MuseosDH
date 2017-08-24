require 'test_helper'

class PreciosControllerTest < ActionDispatch::IntegrationTest
  setup do
    @precio = precios(:one)
  end

  test "should get index" do
    get precios_url
    assert_response :success
  end

  test "should get new" do
    get new_precio_url
    assert_response :success
  end

  test "should create precio" do
    assert_difference('Precio.count') do
      post precios_url, params: { precio: { precio: @precio.precio, tipo: @precio.tipo } }
    end

    assert_redirected_to precio_url(Precio.last)
  end

  test "should show precio" do
    get precio_url(@precio)
    assert_response :success
  end

  test "should get edit" do
    get edit_precio_url(@precio)
    assert_response :success
  end

  test "should update precio" do
    patch precio_url(@precio), params: { precio: { precio: @precio.precio, tipo: @precio.tipo } }
    assert_redirected_to precio_url(@precio)
  end

  test "should destroy precio" do
    assert_difference('Precio.count', -1) do
      delete precio_url(@precio)
    end

    assert_redirected_to precios_url
  end
end
