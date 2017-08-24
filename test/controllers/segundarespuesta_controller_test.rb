require 'test_helper'

class SegundarespuestaControllerTest < ActionDispatch::IntegrationTest
  setup do
    @segundarespuestum = segundarespuesta(:one)
  end

  test "should get index" do
    get segundarespuesta_url
    assert_response :success
  end

  test "should get new" do
    get new_segundarespuestum_url
    assert_response :success
  end

  test "should create segundarespuestum" do
    assert_difference('Segundarespuestum.count') do
      post segundarespuesta_url, params: { segundarespuestum: { correo: @segundarespuestum.correo, descripcion: @segundarespuestum.descripcion, nombre: @segundarespuestum.nombre } }
    end

    assert_redirected_to segundarespuestum_url(Segundarespuestum.last)
  end

  test "should show segundarespuestum" do
    get segundarespuestum_url(@segundarespuestum)
    assert_response :success
  end

  test "should get edit" do
    get edit_segundarespuestum_url(@segundarespuestum)
    assert_response :success
  end

  test "should update segundarespuestum" do
    patch segundarespuestum_url(@segundarespuestum), params: { segundarespuestum: { correo: @segundarespuestum.correo, descripcion: @segundarespuestum.descripcion, nombre: @segundarespuestum.nombre } }
    assert_redirected_to segundarespuestum_url(@segundarespuestum)
  end

  test "should destroy segundarespuestum" do
    assert_difference('Segundarespuestum.count', -1) do
      delete segundarespuestum_url(@segundarespuestum)
    end

    assert_redirected_to segundarespuesta_url
  end
end
