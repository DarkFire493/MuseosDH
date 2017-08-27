require 'test_helper'

class QrCodeReadersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @qr_code_reader = qr_code_readers(:one)
  end

  test "should get index" do
    get qr_code_readers_url
    assert_response :success
  end

  test "should get new" do
    get new_qr_code_reader_url
    assert_response :success
  end

  test "should create qr_code_reader" do
    assert_difference('QrCodeReader.count') do
      post qr_code_readers_url, params: { qr_code_reader: { checkin: @qr_code_reader.checkin, disscount: @qr_code_reader.disscount, person: @qr_code_reader.person } }
    end

    assert_redirected_to qr_code_reader_url(QrCodeReader.last)
  end

  test "should show qr_code_reader" do
    get qr_code_reader_url(@qr_code_reader)
    assert_response :success
  end

  test "should get edit" do
    get edit_qr_code_reader_url(@qr_code_reader)
    assert_response :success
  end

  test "should update qr_code_reader" do
    patch qr_code_reader_url(@qr_code_reader), params: { qr_code_reader: { checkin: @qr_code_reader.checkin, disscount: @qr_code_reader.disscount, person: @qr_code_reader.person } }
    assert_redirected_to qr_code_reader_url(@qr_code_reader)
  end

  test "should destroy qr_code_reader" do
    assert_difference('QrCodeReader.count', -1) do
      delete qr_code_reader_url(@qr_code_reader)
    end

    assert_redirected_to qr_code_readers_url
  end
end
