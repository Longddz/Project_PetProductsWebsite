const UserModel = require("../model/UserModel");
const { generateToken } = require("../utils/jwtUtils");

const path = require('path');

// Import validator 
const validator = require("validator");
const EmailService = require("./Mailer");

// Import bcrypt
const bcrypt = require("bcrypt");

// Tạo instance duy nhất của EmailService
const emailService = new EmailService();

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Kiểm tra người dùng có tồn tại không
        const userToken = await UserModel.findOne({ email });

        if (!userToken) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        // Kiểm tra mật khẩu
        const isMatch = await userToken.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        // Tạo JWT token
        const token = generateToken(userToken._id, userToken.role);

        res.status(200).json({ message: "Đăng nhập thành công!", token });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi đăng nhập!" });
    }
};

const register = async (req, res) => {
    const {email, password, userName, role, adminCode} = req.body;

    try{
        if (!email || !password || !userName || !role)
        {
            return res.status(400).json({msg: "Vui lòng nhập đủ thông tin đăng ký gồm email, userName, password, role!"});
        }

        if (!validator.isEmail(email))
        {
            return res.status(400).json({msg: "Email không hợp lệ! nhập đúng mẫu Email ví dụ: abc123@gmail.com"});
        }

        const emailExists = await UserModel.findOne({email});

        if (emailExists)
        {
            return res.status(400).json({msg: "Email đã tồn tại và được đăng ký cho một tài khoản khác, vui lòng kiểm tra lại!"});
        }

        if (!(role.toLowerCase() === "admin".toLowerCase()) && !(role.toLowerCase() === "user".toLowerCase()))
        {
            return res.status(400).json({msg: "Có vẻ bạn đang đăng ký không đúng vai trò, hệ thống chỉ cho đăng ký role tức vai trò là admin và user"});
        }

        if (role.toLowerCase() === "admin".toLowerCase()) {
            if (!adminCode) {
                return res.status(400).json({ 
                    msg: "Bạn đăng ký làm admin nhưng chưa nhập mã admin. Vui lòng nhập mã admin để xác thực!" 
                });
            }
        
            if (adminCode !== process.env.ADMIN_CODE) { // Không cần toLowerCase()
                return res.status(400).json({ 
                    msg: "Mã admin không đúng! Vui lòng nhập đúng mã để đăng ký làm admin hoặc đăng ký làm User nếu không muốn xác thực." 
                });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new UserModel({
            customerName: "Bạn chưa cập nhật tên của mình!, hãy vào thông tin cá nhân để cập nhật!",
            phoneNumber: "Bạn chưa cập nhật số điện thoại của mình!, hãy vào thông tin cá nhân để cập nhật!",
            customerAddress: "Bạn chưa cập nhật địa chỉ của mình!, hãy vào thông tin cá nhân để cập nhật!",
            email,
            userName,
            password: hashedPassword,
            role
        })

        await newUser.save();

        // Gửi email chào mừng
        try {
            const mailDetails = emailService.createMailOptions(
                email,
                'Well come to Pet products sales web system',
                'Chúc mừng bạn đã đăng ký tài khoản trên hệ thống thành công!',
                [{
                    filename: 'Hello.jpg',
                    path: path.join(__dirname, '..', 'uploads', 'Hello.jpg'),
                    contentType: 'image/jpg'
                }]
            );
            await emailService.sendMail(mailDetails);
        } catch (emailError) {
            console.log('Lỗi khi gửi email chào mừng:', emailError);
            // Không throw lỗi, chỉ ghi log để không ảnh hưởng đến response
        }

        return res.status(200).json({msg: "Thêm tài khoản thành công: \n", 
            email: email, 
            userName: userName, 
            role: role
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi đăng ký!" });
    }
};

module.exports = { login, register };
